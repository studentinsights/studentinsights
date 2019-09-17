# For importing reading data from Google Sheets or a local folder of csvs.
class SomervilleMegaReadingImporter
  def initialize(school_year, options = {})
    @school_year = school_year
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    # @matcher = options.fetch(:matcher, ImportMatcher.new)
    # @syncer = ::RecordSyncer.new(log: @log)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
  end

  def import
    streaming_csvs = read_or_fetch_sheet
    if streaming_csvs.nil?
      log('Aborting since no CSV found...')
      return
    end

    log('Starting loop...')
    @valid_student_names_count = 0
    @invalid_student_name_count = 0
    @valid_data_points_count = 0

    processor = MegaReadingProcessor.new(read_uploaded_by_educator_from_env, @school_year)
    streaming_csvs.each_with_index do |tab, index|
      rows, meta = processor.process(tab.tab_csv)
      log("processed #{index} sheets.")
      rows.each_with_index {|row, index| import_row(row, index)}
      valid_student_names_count, valid_data_points_count, invalid_student_name_count = meta.values_at(
        :valid_student_names_count, :valid_data_points_count, :invalid_student_name_count)
      @valid_student_names_count += valid_student_names_count
      @invalid_student_name_count += invalid_student_name_count
      @valid_data_points_count += valid_data_points_count

    end
    log('Done loop.')
    log("@valid_student_names_count: #{@valid_student_names_count}")
    log("@invalid_student_names_count: #{@invalid_student_names_count}")
    log("@valid_data_points_count: #{@valid_data_points_count}")

    # log('Calling #delete_unmarked_records...')
    # @syncer.delete_unmarked_records!(records_within_scope)
    # log("Sync stats: #{@syncer.stats}")
    nil
  end

  private

  def read_or_fetch_sheet
    sheet_id = read_sheet_id_from_env
    streaming_csvs = @fetcher.get_tabs_from_sheet(sheet_id)
  end

  def read_uploaded_by_educator_from_env
    educator_login_name = ENV.fetch('READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME', '')
    uploaded_by_educator = Educator.find_by_login_name(educator_login_name).id
    raise '#read_uploaded_by_educator_from_env found nil' if uploaded_by_educator.nil?
    uploaded_by_educator
  end

  def read_sheet_id_from_env
    sheet_id = PerDistrict.new.imported_google_folder_ids('reading_benchmarks_sheet_id')
    raise '#read_sheet_id_from_env found nil' if sheet_id.nil?
    sheet_id
  end

  def import_row(row, index)
    benchmark_data_point = matching_student_insights_record_for_row(row)
    benchmark_data_point.save!
  end

  def matching_student_insights_record_for_row(row)
    benchmark_data_point = ReadingBenchmarkDataPoint.find_or_initialize_by(
      student_id: row[:student_id],
      educator: Educator.find(row[:educator_id]), #because sheets don't explicitly link an educator to a record
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
