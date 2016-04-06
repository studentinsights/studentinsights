class StudentsImporter < Struct.new :school_scope, :client

  def remote_file_name
    'students_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    student = StudentRow.new(row, school_ids_dictionary).build
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
