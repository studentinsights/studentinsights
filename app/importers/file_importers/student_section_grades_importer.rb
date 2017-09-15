class StudentSectionGradesImporter < Struct.new :school_scope, :client, :log, :progress_bar
  def initialize(*)
    super
    self.student_lasid_map = Student.all.pluck(:local_id,:id).to_h
    self.section_number_map = ActiveRecord::Base.connection.execute("select CONCAT(sections.section_number, '|', sections.term_local_id, '|', schools.local_id, '|', courses.course_number), sections.id  from sections inner join courses on courses.id = sections.course_id inner join schools on schools.id = courses.school_id").values.to_h
  end

  attr_accessor :student_lasid_map
  attr_accessor :section_number_map

  def remote_file_name
    'student_averages_export.txt'
  end

  def data_transformer
    CsvTransformer.new(%w[section_number student_local_id school_local_id course_number term_local_id grade])
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def import_row(row)
    student_section_assignment = StudentSectionGradeRow.new(row, student_lasid_map, section_number_map).build
    if student_section_assignment
      student_section_assignment.save!
    else
      log.write("Student Section Grade Import invalid row: #{row}")
    end
  end
end
