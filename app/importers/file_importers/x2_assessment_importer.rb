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
    @invalid_rows_count = 0
    @successful_rows_count = 0
    @created_new_assessment_type_count = 0
    streaming_csv.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end

    log('Done loop.')
    log("@skipped_old_rows_count: #{@skipped_old_rows_count}")
    log("@assessments_not_in_whitelist: #{@assessments_not_in_whitelist}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
    log("@successful_rows_count: #{@successful_rows_count}")
    log("@created_new_assessment_type_count: #{@created_new_assessment_type_count}")
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

    # Ignore older assessments, optionally
    if @ignore_old && is_old?(row)
      @skipped_old_rows_count = @skipped_old_rows_count + 1
      return
    end

    # Ignore assesments not in the whitelist
    if !row[:assessment_test].match(WHITELIST)
      @assessments_not_in_whitelist = @assessments_not_in_whitelist + 1
      return
    end

    # Some kind of cleanup
    row[:assessment_growth] = nil if !/\D/.match(row[:assessment_growth]).nil?
    row[:assessment_test] = "ACCESS" if row[:assessment_test] == "WIDA-ACCESS"

    # Try to build a student_assessment record (unsaved)
    student_id = lookup_student_id(row[:local_id])
    maybe_student_assessment = case row[:assessment_test]
      when 'MCAS' then McasRow.new(row, student_id, self).build
      when 'ACCESS' then AccessRow.new(row, student_id, self).build
      when 'DIBELS' then DibelsRow.new(row, student_id, self).build
    end
    if maybe_student_assessment.nil?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end

    # Actually save it
    maybe_student_assessment.save!
    @successful_rows_count = @successful_rows_count + 1
  end

  def is_old?(row)
    row[:assessment_date] < @time_now - 365.days
  end

  # This method is public to the Row classes
  # This table is only ~10-100 records, so this prevents repeated queries in the most
  # common case, where the Assessment type already exists.  Also track for logging how many
  # new Assessment type records we're creating.
  def find_or_create_assessment_id(params)
    subject = params.fetch(:subject, nil)
    family = params.fetch(:family, nil)
    # Caching the query, to "find" in memory
    @assessments_array ||= Assessment.all.order(created_at: :asc).to_a
    existing_assessments = @assessments_array.select do |assessment|
      if family && assessment.family != family
        false
      elsif subject && assessment.subject != subject
        false
      else
        true
      end
    end

    # Use the match (log if ambiguous), or create a new Assessment
    if existing_assessments.size == 1
      existing_assessments.first.id
    elsif existing_assessments.size > 1
      log("Found ambiguous match to Assessment for params: #{params.as_json}, choosing the first one: #{existing_assessments.first.id}")
      existing_assessments.first.id
    else
      Assessment.create!(family: family, subject: subject).id
      @created_new_assessment_type_count = @created_new_assessment_type_count + 1
    end
  end

  # Lookup in memory, instead of querying db for every row
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
