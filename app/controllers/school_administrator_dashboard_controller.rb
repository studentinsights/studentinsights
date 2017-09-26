class SchoolAdministratorDashboardController < ApplicationController


  include StudentsQueryHelper

  before_action :set_school

  def show
    active_students = students_for_dashboard(@school)


    student_hashes = active_students.map {|student| student_hash_for_slicing(student)}

    @serialized_data = {
      students: student_hashes,
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  private


  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])

    redirect_to root_url if @school.nil?
  end

  def students_for_dashboard(school)
    school.students.active
  end

end



