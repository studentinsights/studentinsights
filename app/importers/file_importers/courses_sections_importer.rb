class CoursesSectionsImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def import
    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
  end

  def remote_file_name
    'courses_sections_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS'])
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    course = CourseRow.new(row, school_ids_dictionary).build
    if course.school.present?
      if course.save!
        section = SectionRow.new(row, school_ids_dictionary, course.id).build
        section.save
      else
        log.write("Course import invalid row: #{row}")
      end
    else
      log.write("Course import invalid row missing school_local_id: #{row}")
    end
  end

end
