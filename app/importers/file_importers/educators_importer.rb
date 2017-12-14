class EducatorsImporter < Struct.new :school_scope, :client, :log, :progress_bar

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
    DistrictConfig.remote_filenames.fetch('FILENAME_FOR_EDUCATORS_IMPORT')
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    educator = EducatorRow.new(row, school_ids_dictionary).build

    if educator.present?
      educator.save!

      homeroom = Homeroom.find_by_name(row[:homeroom]) if row[:homeroom]
      homeroom.update(educator: educator) if homeroom.present?
    end
  end

end
