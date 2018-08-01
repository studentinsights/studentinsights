class StarReadingImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless zip_file_name.present? && remote_file_name.present?

    log("\nDownloading ZIP file #{zip_file_name}...")

    downloaded_zip = client.download_file(zip_file_name)

    Zip::File.open(downloaded_zip) do |zipfile|
      log("\nImporting #{remote_file_name}...")

      data_string = zipfile.read(remote_file_name).encode('UTF-8', 'binary', {
        invalid: :replace, undef: :replace, replace: ''
      })

      data = data_transformer.transform(data_string)

      data.each_with_index do |row, index|
        import_row(row) if filter.include?(row.fetch('SchoolLocalID'))
        log("processed #{index} rows.") if index % 1000 == 0
      end
    end
  end

  def client
    SftpClient.for_star
  end

  def zip_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STAR_ZIP_FILE')
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STAR_READING_IMPORT', nil)
  end

  def data_transformer
    # Star CSV files use ClassCase headers
    StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    student = Student.find_by_local_id(row.fetch('StudentLocalID'))
    if student.nil?
      log("skipping, StudentLocalID not found: #{row['StudentLocalID']}")
      return
    end

    datetime_string = row.fetch('AssessmentDate')
    day = DateTime.strptime(datetime_string, "%m/%d/%Y")
    time = Time.strptime(datetime_string, "%m/%d/%Y %H:%M:%S")
               .in_time_zone('America/Chicago')   # Times from STAR are in CST

    # Merge together data from DateTime and Time because:
    #  * The Ruby `Time` class handles timezones properly (DateTime has issues)
    #  * The Ruby `DateTime` class stores dates properly
    #  * The only way I found to successfully parse and store this data was to
    #    use both classes and merge the results together
    date_taken = DateTime.new(
      day.year, day.month, day.day,
      time.hour, time.min, time.sec, time.formatted_offset
    )

    test_result = StarReadingResult.find_or_initialize_by(
      student_id: student.id,
      date_taken: date_taken,
    )

    test_result.assign_attributes({
      percentile_rank: row.fetch('PercentileRank'),
      instructional_reading_level: row.fetch('IRL'),
      grade_equivalent: row.fetch('GradeEquivalent'),
      total_time: row.fetch('TotalTime'),
    })

    test_result.save!
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarReadingImporter: #{text}"
  end
end
