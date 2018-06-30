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
        import_row(row) if filter.include?(row)
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

  def star_reading_assessment
    @assessment ||= Assessment.where(family: "STAR", subject: "Reading").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row['AssessmentDate'].split(' ')[0], "%m/%d/%Y")
    student = Student.find_by_local_id(row['StudentLocalID'])
    if student.nil?
      log("skipping, StudentLocalID not found: #{row['StudentLocalID']}")
      return
    end

    star_assessment = StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment: star_reading_assessment
    }).first_or_create!

    star_assessment.update!({
      percentile_rank: row['PercentileRank'],
      instructional_reading_level: row['IRL'],
      grade_equivalent: row['GradeEquivalent']
    })
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarReadingImporter: #{text}"
  end
end
