class SchoolsController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school, :authorize_for_school

  def show
    @serialized_data = json_for_overview(@school)
    render 'shared/serialized_data'
  end

  def overview
    @serialized_data = { school_slug: @school.slug }
    render 'shared/serialized_data'
  end

  def overview_json
    render json: json_for_overview(@school)
  end

  def csv
    authorized_students = @school.students.active
    csv_string = StudentsSpreadsheet.new.csv_string(authorized_students, @school)
    filename = "#{@school.name} - Exported #{Time.now.strftime("%Y-%m-%d")}.csv"
    send_data(csv_string, {
      type: Mime[:csv],
      disposition: "attachment; filename='#{filename}"
    })
  end

  def school_administrator_dashboard
    dashboard_students = students_for_dashboard(@school)
      .includes([homeroom: :educator], :dashboard_absences, :event_notes, :dashboard_tardies)
    dashboard_students_json = dashboard_students.map do |student|
      individual_student_dashboard_data(student)
    end

    @serialized_data = {
      students: dashboard_students_json,
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  #Individual dashboard data endpoints will replace school_administrator_dashboard once they're stable
  def absence_dashboard_data
    student_absence_data = students_for_dashboard(@school)
      .includes([homeroom: :educator], :absences, :event_notes)
      .where("absences.occurred_at >= ?", 1.year.ago).references(:absences)

    student_absence_data_json = student_absence_data.map do |student|
      individual_student_absence_data(student)
    end

    render json: student_absence_data_json
  end

  def tardies_dashboard_data
    student_tardies_data = students_for_dashboard(@school)
      .includes([homeroom: :educator], :tardies, :event_notes)
      .where("tardies.occurred_at >= ?", 1.year.ago).references(:tardies)

    student_tardies_data_json = student_tardies_data.map do |student|
      individual_student_tardies_data(student)
    end

    render json: student_tardies_data_json
  end

  def discipline_dashboard_data
    student_discipline_data = students_for_dashboard(@school)
      .includes([homeroom: :educator], :discipline_incidents, :event_notes)
    student_discipline_data_json = student_discipline_data.map do |student|
      individual_student_discipline_data(student)
    end

    render json: student_discipline_data_json
  end

  # This endpoint is internal-only for now, because of the authorization complexity.
  def courses_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access
    courses = Course.all
      .where(school_id: @school.id)
      .includes(sections: :students)

    courses_json = courses.as_json({
      :only => [:id, :course_number, :course_description],
      :include => {
        :sections => {
          :only => [:id, :section_number, :term_local_id, :schedule, :room_number],
          :include => {
            :students => {
              :only => [:id, :grade, :date_of_birth],
              :include => {
                :school => {
                  :only => [:id, :name]
                }
              }
            }
          }
        }
      }
    })

    render json: {
      courses: courses_json,
      school: @school.as_json(only: [:id, :name])
    }
  end

  private
  def json_for_overview(school)
    authorized_students = authorized_students_for_overview(school)

    student_hashes = log_timing('schools#show student_hashes') do
      load_precomputed_student_hashes(Time.now, authorized_students.map(&:id))
    end

    merged_student_hashes = log_timing('schools#show merge_mutable_fields_for_slicing') do
      merge_mutable_fields_for_slicing(student_hashes)
    end

    {
      students: merged_student_hashes,
      school: school,
      current_educator: current_educator,
      constant_indexes: constant_indexes
    }
  end

  # This should always find a record, but if it doesn't we fall back to the
  # raw query.
  # Results an array of student_hashes.
  def load_precomputed_student_hashes(time_now, authorized_student_ids)
    begin
      # the precompute job runs at 8am UTC, and takes a few minutes to run,
      # so keep a buffer that makes sure the import task and precompute job
      # can finish before cutting over to the next day.
      query_time = time_now - 9.hours
      key = PrecomputedQueryDoc.precomputed_student_hashes_key(query_time, authorized_student_ids)
      logger.warn "load_precomputed_student_hashes querying key: #{key}..."
      doc = PrecomputedQueryDoc.find_by_key(key)
      return parse_hashes_from_doc(doc) unless doc.nil?
    rescue ActiveRecord::StatementInvalid => err
      logger.error "load_precomputed_student_hashes raised error #{err.inspect}"
    end

    # Fallback to performing the full query if something went wrong reading the
    # precomputed value
    logger.error "falling back to full load_precomputed_student_hashes query for key: #{key}"
    authorized_students = Student.find(authorized_student_ids)
    authorized_students.map {|student| student_hash_for_slicing(student) }
  end

  def parse_hashes_from_doc(doc)
    JSON.parse(doc.json).deep_symbolize_keys![:student_hashes]
  end

  # Serialize what are essentially constants stored in the database down
  # to the UI so it can use them for joins.
  def constant_indexes
    {
      service_types_index: ServiceSerializer.service_types_index,
      event_note_types_index: EventNoteSerializer.event_note_types_index
    }
  end

  def authorize_for_school
    unless authorizer.is_authorized_for_school?(@school)
      return redirect_to homepage_path_for_role(current_educator)
    end
  end

  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])
    redirect_to root_url if @school.nil?
  end

  def authorized_students_for_overview(school)
    if current_educator.districtwide_access?
      school.students.active
    else
      current_educator.students_for_school_overview
    end
  end

  # Methods for Dashboard

  def individual_student_dashboard_data(student)
    # This is a temporary workaround for New Bedford
    homeroom_label = student.try(:homeroom).try(:educator).try(:full_name) || student.try(:homeroom).try(:name)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      id: student.id,
      grade: student.grade,
      race: student.race,
      homeroom_label: homeroom_label,
      absences: student.dashboard_absences,
      tardies: student.dashboard_tardies,
      event_notes: student.event_notes
    })
  end

  def individual_student_absence_data(student)
    # Gathers only the information needed for a specific dashboard view.
    homeroom_label = student.try(:homeroom).try(:educator).try(:full_name) || student.try(:homeroom).try(:name)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      id: student.id,
      homeroom_label: homeroom_label,
      absences: student.dashboard_absences,
      event_notes: student.event_notes
    })
  end

  def individual_student_tardies_data(student)
    # Gathers only the information needed for a specific dashboard view.
    homeroom_label = student.try(:homeroom).try(:educator).try(:full_name) || student.try(:homeroom).try(:name)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      id: student.id,
      homeroom_label: homeroom_label,
      tardies: student.dashboard_tardies,
      event_notes: student.event_notes
    })
  end

  def individual_student_discipline_data(student)
    # Gathers only the information needed for a specific dashboard view.
    homeroom_label = student.try(:homeroom).try(:educator).try(:full_name) || student.try(:homeroom).try(:name)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      id: student.id,
      homeroom_label: homeroom_label,
      grade: student.grade,
      race: student.race,
      discipline_incidents: student.discipline_incidents,
      event_notes: student.event_notes
    })
  end

  def students_for_dashboard(school)
    school.students.active
  end
end
