class DistrictController < ApplicationController
  before_action :ensure_authorized_for_districtwide!

  def overview_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access

    enable_student_voice_uploads = PerDistrict.new.enabled_student_voice_survey_uploads? && current_educator.labels.include?('can_upload_student_voice_surveys')
    schools_with_active_students = School.all.includes(:students).select {|school| school.students.active.size > 0 }
    schools = schools_with_active_students.sort_by do |school|
      [School::ORDERED_SCHOOL_TYPES.find_index(school.school_type), school.name]
    end
    render json: {
      show_work_board: EnvironmentVariable.is_true('SHOW_WORK_BOARD'),
      enable_student_voice_uploads: enable_student_voice_uploads,
      schools: schools.as_json(only: [:id, :name]),
      current_educator: current_educator.as_json(only: [:id, :admin, :can_set_districtwide_access], methods: [:labels])
    }
  end

  def enrollment_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access

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
  private
  def ensure_authorized_for_districtwide!
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access
  end
end
