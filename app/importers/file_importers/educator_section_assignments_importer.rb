class EducatorSectionAssignmentsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @imported_assignments = []
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
    end

    delete_rows
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch(
      'FILENAME_FOR_EDUCATOR_SECTION_ASSIGNMENT_IMPORT', nil
    )
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    #For the schools imported during this run of the importer
    EducatorSectionAssignment.joins(:section => {:course => :school})
                             .where.not(id: @imported_assignments)
                             .where(:schools => {:local_id => @school_scope}).delete_all
  end

  def import_row(row)
    educator_section_assignment = EducatorSectionAssignmentRow.new(row).build

    if educator_section_assignment
      educator_section_assignment.save!
      @imported_assignments.push(educator_section_assignment.id)
    else
      @log.write("Educator Section Assignment Import invalid row: #{row}")
    end
  end

end
