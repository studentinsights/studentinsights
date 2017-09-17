class EducatorSectionAssignmentsImporter < Struct.new :school_scope, :client, :log, :progress_bar
  def initialize(*)
    super
    @processed_ids = []
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

  def delete_old_rows
    EducatorSectionAssignment.where.not(id: @processed_ids).delete_all
  end

  def import_row(row)
    educator_section_assignment = EducatorSectionAssignmentRow.new(row).build

    if educator_section_assignment
      educator_section_assignment.save!
      @processed_ids << educator_section_assignment.id
    else
      log.write("Educator Section Assignment Import invalid row: #{row}")
    end
  end

end
