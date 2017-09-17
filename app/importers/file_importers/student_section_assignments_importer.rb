class StudentSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar
  def initialize(*)
    super
    @processed_ids = []
  end

  def remote_file_name
    'student_section_assignment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def delete_old_rows
    StudentSectionAssignment.where.not(id: @processed_ids).delete_all
  end

  def import_row(row)
    student_section_assignment = StudentSectionAssignmentRow.new(row).build
    if student_section_assignment
      student_section_assignment.save!
      @processed_ids << student_section_assignment.id
    else
      log.write("Student Section Assignment Import invalid row: #{row}")
    end
  end
end
