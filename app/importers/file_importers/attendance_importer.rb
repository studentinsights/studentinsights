class AttendanceImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @success_count = 0
    @error_list = []

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)

      if progress_bar
        log.write("\r#{@success_count} valid rows imported, #{@error_list.size} invalid rows skipped")
      end
    end

    if progress_bar
      @error_summary = @error_list.inject(Hash.new(0)) { |h, e| h[e] += 1 ; h }
      log.write("\n\nInvalid attendance rows summary: ")
      log.write(@error_summary)
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
    attendance_event = AttendanceRow.build(row)

    if attendance_event.valid?
      attendance_event.save!
      @success_count += 1
    else
      @error_list << attendance_event.errors.messages
    end
  end

end
