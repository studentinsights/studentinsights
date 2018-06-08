class DistrictController < ApplicationController
  before :ensure_districtwide_access!

  def enrollment_json
    # students, grouped by school and grade
    authorized_students = authorized { Student.active }
    groups = authorized_students.group_by do |student|
      [student.school_id, student.grade]
    end

    # serialize
    enrollments_json = groups.map do |key, students|
      school_id, grade = key
      {
        enrollment: students.size,
        grade: grade,
        school: School.find(school_id).as_json({
          only: [:id, :school_type, :local_id, :name, :slug]
        })
      }
    end

    # let UI render districts differently
    per_district = PerDistrict.new
    render json: {
      district_key: per_district.district_key,
      district_name: per_district.district_name,
      enrollments: enrollments_json
    }
  end

  def notes_heatmap_json    
    render json: {
      notes: serialized_heatmap_notes
    }
  end

  def restricted_notes_heatmap_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_view_restricted_notes?
    render json: {
      notes: serialized_heatmap_notes(is_restricted: true)
    }
  end

  private
  def serialized_heatmap_notes(options = {})
    is_restricted = options[:is_restricted] == true
    notes = EventNote
      .where(is_restricted: is_restricted)
      .includes(:student)

    # Limit the fields we send down, but include the
    # student's grade.
    notes.map do |note|
      note.as_json.slice(
        'id',
        'recorded_at',
        'student_id',
        'event_note_type_id'
      ).merge({
        grade: note.student.grade
      })
    end
  end

  def ensure_districtwide_access!
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access?
  end
end
