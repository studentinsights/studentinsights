# Intended to be minimally generic, for use across math and
# reading to get percentiles and GLE.
class StarImporter
  def initialize(options:)
    @model_class = options.fetch(:model_class, nil)
    @remote_file_name = options.fetch(:remote_file_name, nil)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log, nil)
    @invalid_rows_count = 0
    @skipped_from_school_filter = 0
    @student_id_not_found_count = 0

    raise 'missing option: model_class' if @model_class.nil?
    raise 'missing option: remote_file_name' if @remote_file_name.nil?
  end

  def import
    return unless zip_file_name.present? && @remote_file_name.present?

    log("\nDownloading ZIP file #{zip_file_name}...")

    downloaded_zip = client.download_file(zip_file_name)

    Zip::File.open(downloaded_zip) do |zipfile|
      log("\nImporting #{@remote_file_name}...")

      data_string = zipfile.read(@remote_file_name).encode('UTF-8', 'binary', {
        invalid: :replace,
        undef: :replace,
        replace: ''
      })

      data = data_transformer.transform(data_string)

      data.each_with_index do |row, index|
        import_row(row)
        log("processed #{index} rows.") if index % 1000 == 0
      end

      log("skipped #{@invalid_rows_count} invalid rows.")
      log("skipped #{@skipped_from_school_filter} rows because of school filter.")
      log("skipped #{@student_id_not_found_count} rows because student not found.")
    end
  end

  def client
    PerDistrict.new.client_for_star_importer
  end

  def zip_file_name
    PerDistrict.new.remote_filename_for_star
  end

  def data_transformer
    # Star CSV files use ClassCase headers
    StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
  end

  def school_filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(raw_row)
    # Handle differences in migrations across districts and different
    # format exports.
    row = PerDistrict.new.parsed_normalized_star_row(raw_row)

    # Skip based on school filter
    if !school_filter.include?(row['SchoolIdentifier'])
      @skipped_from_school_filter += 1
      return
    end

    # match student
    student_local_id = row['StudentIdentifier']
    student = Student.find_by_local_id(student_local_id)
    if student.nil?
      @student_id_not_found_count += 1
      return
    end

    test_result = @model_class.find_or_initialize_by(
      student_id: student.id,
      date_taken: row['CompletedDate'] # parsed into Time
    )

    test_result.assign_attributes({
      percentile_rank: row['PercentileRank'],
      grade_equivalent: row['GradeEquivalent'],
      total_time: row['TotalTimeInSeconds']
    })

    if test_result.invalid?
      @invalid_rows_count += 1
      log("errors.keys: #{test_result.errors.keys}")
      return nil
    end

    test_result.save!
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarImporter: #{text}"
  end
end
