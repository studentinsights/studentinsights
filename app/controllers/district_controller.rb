class DistrictController < ApplicationController
  def enrollment_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access

    # students
    authorized_students = authorized { Student.all }
    students_json = authorized_students.map do |student|
      student.as_json({
        only: [:id, :grade, :school_id, :date_of_birth],
      })
    end

    # group by school and grade
    groups = students_json.group_by do |student_json|
      [student_json['school_id'], student_json['grade']].join('_')
    end

    # serialize
    enrollments_json = groups.map do |key, students|
      school_id, grade = key.split('_')
      {
        school: School.find(school_id).as_json({
          only: [:id, :school_type, :local_id, :name, :slug]
        }),
        grade: grade,
        enrollment: students.size
      }
    end

    per_district = PerDistrict.new
    render json: {
      district_key: per_district.district_key,
      district_name: per_district.district_name,
      enrollments: enrollments_json
    }
  end
end
