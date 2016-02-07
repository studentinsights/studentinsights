class SchoolsController < ApplicationController

  before_action :authenticate_educator!,
                :assign_school,
                :authorize

  before_action :assign_students_for_show_page,     only: [:show]
  before_action :assign_students_for_star_reading,  only: [:star_reading]

  def show
    @serialized_students = @students.map do |student|
      student.decorate.as_json_for_school_overview
    end

    @serialized_data = {
      students: @serialized_students,
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end

  def star_reading
    @serialized_students = @students.map do |student|
      student.decorate.as_json_for_star_reading
    end

    @serialized_data = {
      students_with_star_reading: @serialized_students,
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end

  private

  def authorize
    redirect_to(homepage_path_for_current_educator) unless current_educator.schoolwide_access? ||
                                                           current_educator.has_access_to_grade_levels?

    if current_educator.has_access_to_grade_levels?
      grade_message = " Showing students in grades #{current_educator.grade_level_access.to_sentence}."
      flash[:notice] << grade_message if flash[:notice]
    end
  end

  def assign_school
    @school = School.friendly.find(params[:id])
  end

  def assign_students_for_show_page
    @students = current_educator.students_for_school_overview
  end

  def assign_students_for_star_reading
    @students = current_educator.students_for_school_overview(:student_assessments)
  end

end
