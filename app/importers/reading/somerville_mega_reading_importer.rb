# For importing reading data from Google Sheets.
class SomervilleMegaReadingImporter
  def initialize(options:)
    @explicit_folder_id = options.fetch(:folder_id, nil)
    @school_year = options.fetch(:school_year, SchoolYear.to_school_year(Time.now))
    if @school_year != 2019
      raise "aborting because of unexpected school_year; review the syncer scoping closely before running on another year"
    end
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @dry_run = options.fetch(:dry_run, false)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new(log: @log))
    @syncer = ::RecordSyncer.new(log: @log)

    @processors_used = []
    @all_rows = []
  end

  def import
    log('Reading env...')
    uploaded_by_educator = read_uploaded_by_educator_from_env()

    log('Fetching tabs...')
    tabs = fetch_tabs()
    if tabs.nil?
      log('Aborting since no CSV found...')
      return
    end
    log("Found #{tabs.size} tabs.")

    # reset metrics
    @valid_student_names_count = 0
    @valid_data_points_count = 0
    @blank_student_name_count = 0
    @invalid_student_name_count = 0
    @all_rows = []

    log('Starting loop...')
    tabs.each_with_index do |tab, tab_index|
      # process sheet into rows
      log("\n\ntab.name: #{tab.tab_name}")
      log("processing sheet:#{tab_index}...")
      processor = MegaReadingProcessor.new(uploaded_by_educator, @school_year, options: {
        log: @log
      })
      rows, processor_stats = processor.process(tab.tab_csv)

      # aggregate stats across processors
      @processors_used << processor
      @all_rows += rows
      @valid_student_names_count += processor_stats[:valid_student_names_count]
      @valid_data_points_count += processor_stats[:valid_data_points_count]
      @blank_student_name_count += processor_stats[:blank_student_name_count]
      @invalid_student_name_count += processor_stats[:invalid_student_name_count]

      # do something with rows, or not if dry run
      if @dry_run
        log('  skipping, dry_run: true...')
      else
        rows.each_with_index {|row, index| import_row(row, index)}
      end
    end

    log('Done loop.')
    log("@valid_student_names_count: #{@valid_student_names_count}")
    log("@valid_data_points_count: #{@valid_data_points_count}")
    log("@blank_student_name_count: #{@blank_student_name_count}")
    log("@invalid_student_name_count: #{@invalid_student_name_count}")

    log('Calling #delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("Sync stats: #{@syncer.stats}")
    nil
  end

  private
  def fetch_tabs
    folder_id = @explicit_folder_id.present? ? @explicit_folder_id : read_folder_id_from_env()
    @fetcher.get_tabs_from_folder(folder_id, recursive: true)
  end

  def read_uploaded_by_educator_from_env
    educator_login_name = ENV.fetch('READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME', '')
    uploaded_by_educator = Educator.find_by_login_name(educator_login_name).try(:id)
    raise '#read_uploaded_by_educator_from_env found nil' if uploaded_by_educator.nil?
    uploaded_by_educator
  end

  def read_folder_id_from_env
    folder_id = PerDistrict.new.imported_google_folder_ids('reading_benchmarks_folder_id')
    raise '#read_folder_id_from_env found nil' if folder_id.nil?
    folder_id
  end

  # Explicitly scope to specific school year.  Dates are specific and intentional, and
  # slightly different than the actual school year calendar because of timing differences.
  def records_within_scope
    if @school_year != 2019
      raise "aborting because of unexpected school_year; review the syncer scoping closely before running on another year"
    end
    ReadingBenchmarkDataPoint.all
      .where('created_at > ?', DateTime.new(@school_year, 9, 15))
      .where('created_at < ?', DateTime.new(@school_year+1, 8, 15))
  end

  def import_row(row, index)
    maybe_benchmark_data_point = matching_student_insights_record_for_row(row)
    @syncer.validate_mark_and_sync!(maybe_benchmark_data_point)
  end

  def matching_student_insights_record_for_row(row)
    benchmark_data_point = ReadingBenchmarkDataPoint.find_or_initialize_by(
      student_id: row[:student_id],
      educator_id: row[:educator_id], #because sheets don't explicitly link an educator to a record
      benchmark_school_year: row[:benchmark_school_year],
      benchmark_period_key: row[:benchmark_period_key],
      benchmark_assessment_key: row[:benchmark_assessment_key]
    )
    benchmark_data_point.assign_attributes(
      json: row[:json]
    )

    benchmark_data_point
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "SomervilleMegaReadingImporter: #{text}"
  end
end
