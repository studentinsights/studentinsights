class StudentSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'student_section_assignment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def delete_rows()
    StudentSectionAssignment.delete_all
  end

  def import_row(row)
    student_section_assignment = StudentSectionAssignmentRow.new(row).build
    student_section_assignment.save!
  end

end
