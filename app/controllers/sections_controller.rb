class SectionsController < ApplicationController
  before_action :authenticate_districtwide_access!, only: :index # Extra authentication layer

  def index
    #just setting this to all courses for now
    #since we are only testing with district wide admins
    @educator_courses = Course.all.order(:course_number)
  end

  def section_json
    current_section = authorized_section(params[:id])
    students = authorized { current_section.students } # extra layer while transitioning K8 to use sections
    students_json = serialize_students(students.map(&:id), current_section)
    section = serialize_section(current_section)

    render json: {
      students: students_json,
      section: section,
      sections: current_educator.allowed_sections
    }
  end

  private
  def authorized_section(section_id)
    # Extra layers since we don't yet allow K8 teachers to view sections
    Exceptions::EducatorNotAuthorized unless PerDistrict.new.high_school_enabled?
    Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access || current_educator.school.is_high_school?

    section = Section.find(params[:id])
    Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_section(section)
    section
  end

  def authenticate_districtwide_access!
    unless current_educator.districtwide_access
      redirect_to not_authorized_path
    end
  end

  # Include grade for section as well
  def serialize_students(student_ids, section)
    students = Student
      .where(id: student_ids)
      .includes(:student_section_assignments)

    students.map do |student|
      grade_numeric = student.student_section_assignments.find_by_section_id(section.id).grade_numeric
      student.as_json(methods: [
        :event_notes_without_restricted,
        :most_recent_school_year_discipline_incidents_count,
        :most_recent_school_year_absences_count,
        :most_recent_school_year_tardies_count
      ]).merge({
        grade_numeric: grade_numeric
      })
    end
  end

  def serialize_section(section)
    section.as_json(methods: [:course_number, :course_description])
  end
end
