class StudentsImporter

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "full_name", "home_language", "program_assigned",
    #   "limited_english_proficiency", "sped_placement", "disability", "sped_level_of_need",
    #   "plan_504", "student_address", "grade", "registration_date", "free_reduced_lunch",
    #   "homeroom", "school_local_id" ]

    'students_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def import_row(row)
    student = Student.where(local_id: row[:local_id]).first_or_create!
    attributes = Hash[row].except(:local_id, :school_local_id, :full_name, :homeroom)
    student.update_attributes(attributes)

    parsed_name = split_first_and_last_name(row[:full_name])
    student.assign_attributes(parsed_name)
    if student.save
      assign_student_to_homeroom(student, row[:homeroom])
      student.create_student_risk_level!
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
    homeroom.students << student
  end

end
