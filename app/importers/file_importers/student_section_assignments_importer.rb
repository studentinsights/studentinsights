class StudentSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar
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
    ENV.fetch('FILENAME_FOR_STUDENTS_SECTION_ASSIGNMENT_IMPORT')
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    #For the schools imported during this run of the importer
    StudentSectionAssignment.joins(:section => {:course => :school})
                            .where.not(id: @imported_assignments)
                            .where(:schools => {:local_id => school_scope}).delete_all

  end

  def import_row(row)
    student_section_assignment = StudentSectionAssignmentRow.new(row).build
    if student_section_assignment
      student_section_assignment.save!
      @imported_assignments.push(student_section_assignment.id)
    else
      log.write("Student Section Assignment Import invalid row: #{row}")
    end
  end
end
