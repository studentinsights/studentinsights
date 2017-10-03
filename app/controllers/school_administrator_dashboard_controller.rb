class SchoolAdministratorDashboardController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school

  def show
    active_students = students_for_dashboard(@school)

    dashboard_students = active_students.map { |student| individual_student_dashboard_data(student) }

    @serialized_data = dashboard_students.to_json
    render 'shared/serialized_data'
  end

  private


  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])

    redirect_to root_url if @school.nil?
  end

  def list_student_absences(student)
    student.absences.map {|absence| absence.occurred_at}
  end

  def individual_student_dashboard_data(student)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      homeroom: student.homeroom_id,
      absences: list_student_absences(student)
      }
    )
  end

  def students_for_dashboard(school)
    school.students.active
  end



end
