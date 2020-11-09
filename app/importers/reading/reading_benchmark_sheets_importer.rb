# For importing reading data from Google Sheets.
class ReadingBenchmarkSheetsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_FOLDER,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [],
      merge: DataFlow::MERGE_UPDATE_DELETE_UNMARKED,
      touches: [
        ReadingBenchmarkDataPoint.name
      ],
      description: 'Import reading benchmark data for the specific school year 2019-2020, by reading all sheets within a Google Drive folder'
    })
  end

  def initialize(options:)
    @explicit_folder_id = options.fetch(:folder_id, nil)
    @school_year = options.fetch(:school_year, SchoolYear.to_school_year(Time.now))
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::FakeLog.new : STDOUT)
    @dry_run = options.fetch(:dry_run, false)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new(log: @log))
    @syncer = ::RecordSyncer.new(log: @log)
    if @explicit_folder_id.present?
      log("\n\nwarning, if @explicit_folder_id is set, sync will not be called to prevent destroying other data\n\n")
    end

    @processors_used = []
    @all_rows = []
  end

  def import
    if !PerDistrict.new.reading_benchmark_sheets_importer_enabled?
      log('Aborting since not enabled...')
      return
    end

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

    log('Starting transaction on ReadingBenchmarkDataPoint...')
    ReadingBenchmarkDataPoint.transaction do
      log('Starting loop...')
      tabs.each_with_index do |tab, tab_index|
        # process sheet into rows
        log("\n\ntab_id: #{tab.tab_id}, tab.name.first(1): #{tab.tab_name.first(1)}") # avoid logging educator names
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

      if @explicit_folder_id.present?
        log('Since @explicit_folder_id is present, skipping call to syncer.')
      else
        log('Calling #delete_unmarked_records...')
        @syncer.delete_unmarked_records!(records_within_scope)
      end
      log("Sync stats.to_json: #{@syncer.stats.to_json}")
    end
    log("Done transaction.")
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
  # slightly different than the actual school year calendar because of timing differences,
  # and the dates when this import process first started up, and other older ones were
  # stopped.
  def records_within_scope
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
    @log.puts "ReadingBenchmarkSheetsImporter: #{text}"
  end
end
