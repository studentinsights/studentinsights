class SchoolsController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school, :ensure_authorized_for_school!

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
    render json: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER/absences.json')) # dashboard_queries.absence_dashboard_data(@school)
  end

  def tardies_dashboard_data
    render json: dashboard_queries.tardies_dashboard_data(@school)
  end

  def discipline_dashboard_data
    render json: dashboard_queries.discipline_dashboard_data(@school)
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
  def ensure_authorized_for_school!
    raise Exceptions::EducatorNotAuthorized unless authorizer.is_authorized_for_school?(@school)
  end

  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])
    redirect_to root_url if @school.nil?
  end

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
      district_key: PerDistrict.new.district_key,
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
      service_types_index: ServiceSerializer.service_types_index
    }
  end

  def authorized_students_for_overview(school)
    if current_educator.districtwide_access?
      school.students.active
    else
      current_educator.students_for_school_overview
    end
  end

  def dashboard_queries
    DashboardQueries.new(current_educator)
  end
end
