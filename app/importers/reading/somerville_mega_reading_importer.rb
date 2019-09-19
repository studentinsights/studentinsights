# For importing reading data from Google Sheets.
class SomervilleMegaReadingImporter
  def initialize(school_year, options = {})
    @school_year = school_year
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
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
      next if tab.tab_name == "Help"
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
    nil
  end

  private

  def read_or_fetch_sheet
    folder_id = read_folder_id_from_env
    streaming_csvs = @fetcher.get_tabs_from_folder(folder_id)
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

  def import_row(row, index)
    benchmark_data_point = matching_student_insights_record_for_row(row)
    benchmark_data_point.save!
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
