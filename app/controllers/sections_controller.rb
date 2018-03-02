class SectionsController < ApplicationController
  before_action :authorize_and_assign_section, only: :show
  before_action :authenticate_districtwide_access!, only: :index # Extra authentication layer

  def index
    #just setting this to all courses for now
    #since we are only testing with district wide admins
    @educator_courses = Course.all.order(:course_number)
  end

  def show

    section_students = serialize_students(@current_section.students)
    section = serialize_section(@current_section)

    @serialized_data = {
      students: section_students,
      educators: @current_section.educators,
      section: section,
      sections: current_educator.allowed_sections,
      current_educator: current_educator,
    }
    render 'shared/serialized_data'
  end

  private
  def authorize_and_assign_section
    requested_section = Section.find(params[:id])

    if current_educator.is_authorized_for_section(requested_section)
      @current_section = requested_section
    else
      redirect_to homepage_path_for_role(current_educator)
    end
  rescue ActiveRecord::RecordNotFound     # Params don't match an actual section
    redirect_to homepage_path_for_role(current_educator)
  end

  def authenticate_districtwide_access!
    unless current_educator.districtwide_access
      redirect_to not_authorized_path
    end
  end

  def serialize_students(students)
    students.select('students.*, student_section_assignments.grade_numeric')
            .as_json(methods: [:event_notes, :most_recent_school_year_discipline_incidents_count, :most_recent_school_year_absences_count, :most_recent_school_year_tardies_count])
  end

  def serialize_section(section)
    section.as_json(methods: [:course_number, :course_description])
  end
end
