# For importing reading data from Google Sheets or a local folder of csvs.
class SomervilleMegaReadingImporter
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @school_local_ids = options.fetch(:school_scope, [])
    @files_path = options.fetch(:files_path, nil)
    # TODO add dependencies as instance variables
    # @matcher = options.fetch(:matcher, ImportMatcher.new)
    # @syncer = ::RecordSyncer.new(log: @log)
    reset_counters!
  end

  def import
    streaming_csvs = read_or_fetch_sheet
    if streaming_csvs.nil?
      log('Aborting since no CSV found...')
      return
    end

    # TODO do any initialization before the core loop
    log('Starting loop...')
    reset_counters!
    processor = MegaReadingProcessor.new(read_uploaded_by_educator_from_env, 2018)
    streaming_csvs.each_with_index do |csv, index|
      rows, meta = processor.process(csv)
      log("processed #{index} sheets.")
      rows.each_with_index {|row, index| import_row(row, index)}
    end
    log('Done loop.')
    # TODO log counts on stats
    # log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    # log("@skipped_from_student_local_id_filter: #{@skipped_from_student_local_id_filter}")
    # log("@skipped_from_empty_sep_fieldd_006: #{@skipped_from_empty_sep_fieldd_006}")

    # log('Calling #delete_unmarked_records...')
    # @syncer.delete_unmarked_records!(records_within_scope)
    # log("Sync stats: #{@syncer.stats}")
    nil
  end

  private

  def reset_counters!
    # raise 'unfinished'
    # TODO set instance variables to 0
  end

  def read_or_fetch_sheet
    #If a folder is provided, get csvs from that folder
    if @files_path then
      streaming_csvs = []
      Dir.glob(@files_path + "*.csv") do |file|
        streaming_csvs << IO.read(file)
      end
    #if configured to fetch sheets from Google, get sheets
    elsif ENV["SHEET_URL"]
      fetcher = GoogleSheetsFetcher.new
      streaming_csvs = fetcher.get_spreadsheet(ENV["SHEET_URL"])
    else
      log("No sheets found")
      return nil
    end

    streaming_csvs
  end

  #Template sheets do not speciify year, so assume all data is for current school year
  def get_current_school_year
    SchoolYear.to_school_year(Time.now)
  end

  def read_uploaded_by_educator_from_env
    educator_login_name = ENV.fetch('READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME', '')
    uploaded_by_educator = Educator.find_by_login_name(educator_login_name).id
    raise '#read_uploaded_by_educator_from_env found nil' if uploaded_by_educator.nil?
    uploaded_by_educator
  end

  def import_row(row, index)
    benchmark_data_point = matching_student_insights_record_for_row(row)

    benchmark_data_point.save!
    # TODO the main loop!  has to respect options passed to the
    # importer (eg, school_ids_ids filter)
  end

  def records_within_scope
    raise 'unfinished'
    # The caller has to describe what records are in scope of the import (eg,
    # particular schools, date ranges, etc.) and this returns the count of deleted records.
  end

  def matching_student_insights_record_for_row(row)

    benchmark_data_point = ReadingBenchmarkDataPoint.find_or_initialize_by(
      student_id: row[:student_id],
      educator: Educator.find(row[:educator_id]), #because sheets don't explicitly link an educator to a record
      benchmark_school_year: get_current_school_year,
      benchmark_period_key: row[:benchmark_period_key],
      benchmark_assessment_key: row[:benchmark_assessment_key]
    )

    benchmark_data_point.assign_attributes(
      json: row[:json]
    )

    benchmark_data_point
  end

  # def school_filter
  #   SchoolFilter.new(@school_local_ids)
  # end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "SomervilleMegaReadingImporter: #{text}"
  end
end
