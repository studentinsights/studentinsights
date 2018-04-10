class DistrictController < ApplicationController
  def enrollment_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access

    # students, grouped by school and grade
    authorized_students = authorized { Student.all }
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
end
