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
    render json: dashboard_queries.absence_dashboard_data(@school)
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
    authorized_students = authorized { school.students.active }
    if authorized_students.size == 0
      Rollbar.error("json_for_overview found 0 authorized students for educator_id: #{current_educator.id}")
    end

    student_hashes = log_timing('schools#show student_hashes') do
      load_precomputed_student_hashes(authorized_students.map(&:id))
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
  def load_precomputed_student_hashes(authorized_student_ids)
    begin
      doc = PrecomputedQueryDoc.latest_precomputed_student_hashes_for(authorized_student_ids)
      return doc if doc.present?
    rescue ActiveRecord::StatementInvalid => err
      Rollbar.error("load_precomputed_student_hashes raised error for #{current_educator.id}", err)
    end

    # Fallback to performing the full query if something went wrong reading the
    # precomputed value, or the precomputed response couldn't be found.
    fallback_message = "falling back to full load_precomputed_student_hashes query for current_educator: #{current_educator.id}"
    Rollbar.error(fallback_message)
    authorized_students = Student.active.where(id: authorized_student_ids)
    authorized_students.map {|student| student_hash_for_slicing(student) }
  end

  # Serialize what are essentially constants stored in the database down
  # to the UI so it can use them for joins.
  def constant_indexes
    {
      service_types_index: ServiceSerializer.service_types_index
    }
  end

  def dashboard_queries
    DashboardQueries.new(current_educator)
  end
end
