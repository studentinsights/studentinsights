class StudentSectionGradesImporter < Struct.new :school_scope, :client, :log, :progress_bar
  def initialize(*)
    super
    self.student_lasid_map = Student.all.pluck(:local_id,:id).to_h
    self.section_number_map = Section.all.pluck(:section_number, :id).to_h
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
