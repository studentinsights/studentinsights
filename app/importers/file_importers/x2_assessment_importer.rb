class X2AssessmentImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @ignore_old = options.fetch(:ignore_old, false)
    @time_now = options.fetch(:time_now, Time.now)

    @student_ids_map = nil # built lazily
  end

  WHITELIST = Regexp.union(/ACCESS/, /WIDA-ACCESS/, /DIBELS/, /MCAS/).freeze

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Starting loop...')
    @skipped_old_rows_count = 0
    @assessments_not_in_whitelist = 0
    @processed_row_count = 0
    streaming_csv.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end

    log('Done loop.')
    log("@skipped_old_rows_count: #{@skipped_old_rows_count}")
    log("@assessments_not_in_whitelist: #{@assessments_not_in_whitelist}")
    log("@processed_row_count: #{@processed_row_count}")
  end

  def download_csv
    CsvDownloader.new(
      log: @log,
      remote_file_name:
      remote_file_name,
      client: client,
      transformer: data_transformer
    ).get_data
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ASSESSMENT_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    # Expects the following headers:
    #
    #   :state_id, :local_id, :school_local_id, :assessment_date,
    #   :assessment_scale_score, :assessment_performance_level, :assessment_growth,
    #   :assessment_name, :assessment_subject, :assessment_test

    if @ignore_old && is_old?(row)
      @skipped_old_rows_count = @skipped_old_rows_count + 1
      return
    end
    if !row[:assessment_test].match(WHITELIST)
      @assessments_not_in_whitelist = @assessments_not_in_whitelist + 1
      return
    end

    row[:assessment_growth] = nil if !/\D/.match(row[:assessment_growth]).nil?
    row[:assessment_test] = "ACCESS" if row[:assessment_test] == "WIDA-ACCESS"
    student_id = lookup_student_id(row[:local_id])

    case row[:assessment_test]
    when 'MCAS'
      McasRow.build(row, student_id).save!
    when 'ACCESS'
      AccessRow.build(row, student_id).save!
    when 'DIBELS'
      DibelsRow.build(row, student_id).save!
    end
    @processed_row_count = @processed_row_count + 1
  end

  def is_old?(row)
    row[:assessment_date] < @time_now - 365.days
  end

  def lookup_student_id(local_id)
    reset_student_ids_map! if @student_ids_map.nil?
    if !@student_ids_map.has_key?(local_id)
      raise "Could not find student with local_id: #{local_id}"
    end
    @student_ids_map[local_id]
  end

  # Build map all at once, as a performance optimization
  def reset_student_ids_map!
    @student_ids_map = {}
    Student.pluck(:id, :local_id).each do |id, local_id|
      @student_ids_map[local_id] = id
    end
    log("reset_student_ids_map! built map with #{@student_ids_map.keys.size} local_id keys")
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "X2AssessmentImporter: #{text}"
  end
end
