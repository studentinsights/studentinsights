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

  # This is also used by the `ExploresSchoolEquityPage`.
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

  def absence_dashboard_data
    student_absence_data = active_students(@school)
      .includes([homeroom: :educator], :dashboard_absences, :sst_notes)
    student_absence_data_json = student_absence_data.map do |student|
      individual_student_absence_data(student)
    end

    render json: student_absence_data_json
  end

  def tardies_dashboard_data
    student_tardies_data = active_students(@school)
      .includes([homeroom: :educator], :dashboard_tardies, :sst_notes)
    student_tardies_data_json = student_tardies_data.map do |student|
      individual_student_tardies_data(student)
    end

    render json: student_tardies_data_json
  end

  def discipline_dashboard_data
    student_discipline_data = active_students(@school)
      .includes([homeroom: :educator], :discipline_incidents, :sst_notes)
      .where('occurred_at >= ?', 1.year.ago).references(:discipline_incidents)
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

  # Methods for Dashboards #
  def shared_student_fields(student)
    student.as_json(only: [
      :first_name,
      :last_name,
      :grade,
      :id
    ]).merge({
      homeroom_label: homeroom_label(student.homeroom),
      sst_notes: student.sst_notes.as_json(only: [:event_note_type_id, :recorded_at])
    })
  end

  def individual_student_absence_data(student)
    shared_student_fields(student).merge({
      absences: student.dashboard_absences.as_json(only: [:student_id, :occurred_at])
    })
  end

  def individual_student_tardies_data(student)
    shared_student_fields(student).merge({
      tardies: student.dashboard_tardies.as_json(only: [:student_id, :occurred_at])
    })
  end

  def individual_student_discipline_data(student)
    shared_student_fields(student).merge({
      discipline_incidents: student.discipline_incidents.as_json(only: [
        :student_id,
        :incident_code,
        :incident_location,
        :has_exact_time,
        :occurred_at
      ])
    })
  end

  def active_students(school)
    school.students.active
  end

  def homeroom_label(homeroom)
    homeroom.try(:educator).try(:full_name) || homeroom.try(:name) || "No Homeroom"
  end
end
