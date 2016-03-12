class StudentsImporter

  def initialize
    @school_ids_dictionary = School.all.map { |school| [school.local_id, school.id] }.to_h
  end

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
    student = StudentRow.new(row, @school_ids_dictionary).build
    if student.save!
      assign_student_to_homeroom(student, row[:homeroom])
      student.create_student_risk_level!
    end
  end

  def assign_student_to_homeroom(student, homeroom_name)
    homeroom = Homeroom.where(name: homeroom_name).first_or_create!
    homeroom.students << student
  end

end
