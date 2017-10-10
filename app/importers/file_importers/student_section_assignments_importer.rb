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
    'student_section_assignment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def delete_rows
    #Delete all stale rows no longer included in the import
    StudentSectionAssignment.where.not(id: @imported_assignments).delete_all
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
