class EducatorSectionAssignmentsImporter < BaseCsvImporter
  def initialize(*)
    super
    @imported_assignments = []
  end

  def after_import
    delete_rows
  end

  def remote_file_name
    'educator_section_assignment_export.txt'
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    rows_to_delete = EducatorSectionAssignment.where.not(id: @imported_assignments)
    rows_to_delete.delete_all
    import_record_detail.log_deleted(rows_to_delete.count)
  end

  def import_row(row)
    educator_section_assignment = EducatorSectionAssignmentRow.new(row).build

    if educator_section_assignment
      import_record_detail.log_action(educator_section_assignment)
      educator_section_assignment.save!
      @imported_assignments.push(educator_section_assignment.id)
    else
      import_record_detail.log_rejected("Educator Section Assignment Import invalid row: #{row}")
    end
  end

end
