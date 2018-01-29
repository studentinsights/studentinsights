class AttendanceImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ATTENDANCE_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def import_row(row)
    return if Time.current - 90.days > row[:event_date]

    AttendanceRow.build(row).save!
  end
end
