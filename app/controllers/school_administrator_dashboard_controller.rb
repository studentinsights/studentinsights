class SchoolAdministratorDashboardController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school

  def show
    active_students = students_for_dashboard(@school)

    dashboard_students = active_students.map { |student| individual_student_dashboard_data(student) }

    @serialized_data = {
      absences: dashboard_students.to_json
    }
    render 'shared/serialized_data'
  end

  private

  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])

    redirect_to root_url if @school.nil?
  end

  def list_student_absences(student)
    student.absences.map {|absence| absence.order(occurred_at: :desc)}
  end

  def individual_student_dashboard_data(student)
    HashWithIndifferentAccess.new({
      first_name: student.first_name,
      last_name: student.last_name,
      homeroom: student.try(:homeroom).try(:name),
      absences: student.absences.order(occurred_at: :desc)
      }
    )
  end

  def students_for_dashboard(school)
    school.students.active
  end

end
