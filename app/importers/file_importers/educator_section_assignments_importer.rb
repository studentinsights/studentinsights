class EducatorSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def initialize(*)
    super
    @imported_assignments = []
  end

  def import
    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end

    delete_rows
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
