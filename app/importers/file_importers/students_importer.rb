class StudentsImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'students_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS'])
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    student = StudentRow.new(row, school_ids_dictionary).build

    if student.grade.in? ['9', '10', '11', '12', 'SP']
      handle_high_school_student(student)
    else
      handle_elementary_student(student, row)
    end
  end

  def handle_high_school_student(student)
    puts 'HS, no import!' && return if student.new_record?  # We don't want to import HS students into the db
                                                            # since this app isn't being used at the high school

    puts 'HS, update row!'
    student.enrollment_status = 'High School'
    student.grade = 'HS'
    student.school = nil
    student.save!
  end

  def handle_elementary_student(student, row)
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
