class StarMathImporter

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
        import_row(row) if filter.include?(row['SchoolLocalID'])
        @log.puts("processed #{index} rows.") if index % 1000 == 0
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
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STAR_MATH_IMPORT', nil)
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
    date_taken = DateTime.strptime(row['AssessmentDate'], "%m/%d/%Y %H:%M:%S")
    student = Student.find_by_local_id(row['StudentLocalID'])
    if student.nil?
      log("skipping, StudentLocalID not found: #{row['StudentLocalID']}")
      return
    end

    test_result = StarMathResult.find_or_initialize_by(
      student_id: student.id,
      date_taken: date_taken,
    )

    test_result.assign_attributes(
      percentile_rank: row['PercentileRank'],
      grade_equivalent: row['GradeEquivalent'],
      total_time: row['TotalTime']
    )

    test_result.save!
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarMathImporter: #{text}"
  end
end
