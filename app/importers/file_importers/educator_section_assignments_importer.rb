class EducatorSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'educator_section_assignment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def delete_rows()
    EducatorSectionAssignment.delete_all
  end

  def import_row(row)
    educator_section_assignment = EducatorSectionAssignmentRow.new(row).build
    educator_section_assignment.save!
  end

end
