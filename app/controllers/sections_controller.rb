class SectionsController < ApplicationController
  before_action :ensure_feature_enabled!

  def my_sections_json
    my_sections = authorized { current_educator.sections }
    sections_json = my_sections.as_json({
      only: [:id, :room_number, :schedule, :section_number, :term_local_id],
      include: {
        course: {
          only: [:id, :course_number, :course_description],
          include: {
            school: {
              only: [:id, :local_id, :slug, :name]
            }
          }
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
    section = authorized_or_raise! { Section.find(params[:id]) }
    section_students = authorized { section.students.active }
    authorized_sections = authorized { Section.includes(:course).all }

    students_json = serialize_students(section_students.map(&:id), section)
    section_json = section.as_json({
      methods: [:course_number, :course_description],
      include: {
        course: {
          only: [],
          include: {
            school: {
              only: [:id, :local_id, :slug, :name]
            }
          }
        }
      }
    })

    # limit navigator to current school year
    district_school_year = Section.to_district_school_year(SchoolYear.to_school_year(Time.now))
    allowed_sections_for_navigator = authorized_sections.select do |section_for_navigator|
      section_for_navigator.district_school_year == district_school_year
    end
    allowed_sections_json = allowed_sections_for_navigator.as_json({
      only: [:id, :section_number, :term_local_id],
      methods: [:course_description],
    })

    render json: {
      students: students_json,
      section: section_json,
      sections: allowed_sections_json
    }
  end

  private
  def ensure_feature_enabled!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_sections?
  end

  # Include grade for section as well
  def serialize_students(student_ids, section)
    students = Student
      .active
      .where(id: student_ids)
      .includes(:student_section_assignments)

    students.map do |student|
      grade_numeric = student.student_section_assignments.find_by_section_id(section.id).grade_numeric
      student.as_json(methods: [
        :has_photo,
        :event_notes_without_restricted,
        :most_recent_school_year_discipline_incidents_count,
        :most_recent_school_year_absences_count,
        :most_recent_school_year_tardies_count
      ]).merge({
        grade_numeric: grade_numeric
      })
    end
  end
end
