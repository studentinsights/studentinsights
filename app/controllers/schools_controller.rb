class SchoolsController < ApplicationController
  before_action :set_school, :ensure_authorized_for_school!

  # This is also used by the `ExploresSchoolEquityPage`.
  def overview_json
    safe_params = params.permit(:force_querying_on_demand)
    force_querying_on_demand = safe_params.has_key?(:force_querying_on_demand)
    query = SchoolOverviewQueries.new(force_querying_on_demand: force_querying_on_demand)
    overview_json = query.json_for_overview(current_educator, @school)

    render json: overview_json
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

  def dashboard_queries
    DashboardQueries.new(current_educator)
  end
end
