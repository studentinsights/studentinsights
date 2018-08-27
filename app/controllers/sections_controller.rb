class SectionsController < ApplicationController
  before_action :ensure_feature_enabled!

  # This is intended for project leads or developers
  def index
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.high_school_enabled?
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
    @educator_courses = Course.all.order(:course_number)
  end

  def my_sections_json
    sections = authorized_sections { current_educator.sections }
    sections_json = sections.as_json({
      only: [:id, :room_number, :schedule, :section_number, :term_local_id],
      include: {
        course: {
          only: [:id, :course_number, :course_description]
        },
        educators: {
          only: [:id, :full_name, :email]
        }
      }
    })
    render json: {
      sections: sections_json
    }
  end

  def section_json
    current_section = authorized_section(params[:id])
    students = authorized { current_section.students } # extra layer while transitioning K8 to use sections

    students_json = serialize_students(students.map(&:id), current_section)
    section = serialize_section(current_section)
    sections = current_educator.allowed_sections

    render json: {
      students: students_json,
      section: section,
      sections: sections
    }
  end

  private
  def ensure_feature_enabled!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.high_school_enabled?
  end

  def authorized_sections(&block)
    return_value = block.call
    return_value.select do |section|
      authorizer.is_authorized_for_section?(section)
    end
  end

  def authorized_section(section_id)
    # Extra layer since we don't yet allow K8 teachers to view sections
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access || current_educator.school.is_high_school?

    section = Section.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_section(section)
    section
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
