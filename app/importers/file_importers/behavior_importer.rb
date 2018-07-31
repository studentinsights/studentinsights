class BehaviorImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    streaming_csv = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    log('Starting loop...')
    @skipped_from_school_filter = 0
    @skipped_from_invalid_student_id = 0
    @touched_rows_count = 0
    @invalid_rows_count = 0
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end
    log('Done loop.')

    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_from_invalid_student_id: #{@skipped_from_invalid_student_id}")
    log("@touched_rows_count: #{@touched_rows_count}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
  end

  private
  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_BEHAVIOR_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def school_filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    if !school_filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    student = Student.find_by_local_id(row[:local_id])
    if student.nil?
      @skipped_from_invalid_student_id += 1
      log("skipping, StudentLocalID not found: #{row[:local_id]}")
      return
    end

    behavior_event = BehaviorRow.build(row, student.id)
    if !behavior_event.valid?
      @invalid_rows_count += 1
      return
    end

    behavior_event.save!
    @touched_rows_count += 1
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BehaviorImporter: #{text}"
  end
end
