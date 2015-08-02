class StudentsImporter
  include Importer

  def import_row(row)
    student = Student.where(local_id: row[:local_id]).first_or_create!
    attributes = Hash[row].except(:local_id, :school_local_id, :full_name, :homeroom)
    student.update_attributes(attributes)

    parsed_name = split_first_and_last_name(row[:full_name])
    student.assign_attributes(parsed_name)
    if student.save
      assign_student_to_homeroom(student, row[:homeroom])
    end
  end

  def split_first_and_last_name(name_view_from_x2)
    name_split = name_view_from_x2.split(", ")
    case name_split.size
    when 2
      full_name = { first_name: name_split[1], last_name: name_split[0] }
    when 1
      full_name = { first_name: nil, last_name: name_split[0] }
    end
  end

  def assign_student_to_homeroom(student, homeroom_name)
    homeroom = Homeroom.where(name: homeroom_name).first_or_create!
    student.homeroom_id = homeroom.id
    student.save
  end

  def assign_student_to_school(student, school_local_id)
    school = School.where(local_id: school_local_id).first_or_create!
    student.school = school.id
    student.save
  end
end
