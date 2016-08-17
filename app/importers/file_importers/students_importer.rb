class StudentsImporter < Struct.new :school_scope, :client, :log, :progress_bar

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
    return unless student.active?
    name = homeroom_name || (student.school.local_id + ' HOMEROOM')
    homeroom = Homeroom.where(name: name, school: student.school).first_or_create!
    homeroom.students << student
  end

end
