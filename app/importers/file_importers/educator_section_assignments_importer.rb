class EducatorSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar
  def initialize(*)
    super
    @imported_assignments = []
  end

  def remote_file_name
    'educator_section_assignment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    EducatorSectionAssignment.where.not(id: @imported_assignments).delete_all
  end

  def import_row(row)
    educator_section_assignment = EducatorSectionAssignmentRow.new(row).build

    if educator_section_assignment
      educator_section_assignment.save!
      @imported_assignments.push(educator_section_assignment.id)
    else
      log.write("Educator Section Assignment Import invalid row: #{row}")
    end
  end

end
