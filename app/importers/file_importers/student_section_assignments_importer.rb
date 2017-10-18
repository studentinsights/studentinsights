class StudentSectionAssignmentsImporter < BaseCsvImporter
  def initialize(*)
    super
    @imported_assignments = []
  end

  def after_import
    delete_rows
  end

  def remote_file_name
    'student_section_assignment_export.txt'
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    rows_to_delete = StudentSectionAssignment.where.not(id: @imported_assignments)
    rows_to_delete.delete_all
    log_deleted(rows_to_delete.count)
  end

  def import_row(row)
    log_processed
    student_section_assignment = StudentSectionAssignmentRow.new(row).build
    if student_section_assignment
      log_action(import_record_detail)
      student_section_assignment.save!
      @imported_assignments.push(student_section_assignment.id)
    else
      log_rejected("Student Section Assignment Import invalid row: #{row}")
    end
  end
end
