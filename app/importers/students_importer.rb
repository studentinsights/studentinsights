class StudentsImporter < Struct.new :school_scope
  include X2Connector

  def import(student_result, school_result)
    student_result.each do |row|
      school_result.each do |school_row|
        if school_row["SKL_OID"] == row["STD_SKL_OID"]
          school_local_id = school_row["SKL_SCHOOL_ID"]
          grade = row["STD_GRADE_LEVEL"]
          if school_local_id == school_scope.local_id
            student = create_or_update_student(row)
            homeroom_name = row["STD_HOMEROOM"]
            assign_student_to_homeroom(student, homeroom_name)
          end
        end
      end
    end
  end

  def create_or_update_student(row)
    state_id = row["STD_ID_STATE"]
    student = Student.where(state_id: state_id).first_or_create!
    full_name = row["std_name_view"]
    if full_name.present?
      student.last_name = full_name.split(", ")[0]
      student.first_name = full_name.split(", ")[1]
    end
    student.home_language = row["STD_HOME_LANGUAGE_CODE"]
    student.save
    return student
  end

  def assign_student_to_homeroom(student, homeroom_name)
    homeroom = Homeroom.where(name: homeroom_name).first_or_create!
    student.homeroom_id = homeroom.id
    student.save
  end
end
