class StarReadingImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def import
    return unless zip_file_name.present? && remote_file_name.present?

    log.write("\nDownloading ZIP file #{zip_file_name}...")

    downloaded_zip = client.download_file(zip_file_name)

    Zip::File.open(downloaded_zip) do |zipfile|
      log.write("\nImporting #{remote_file_name}...")

      data = zipfile.read(remote_file_name).encode('UTF-8', 'binary', {
        invalid: :replace, undef: :replace, replace: ''
      })

      data.each.each_with_index do |row, index|
        import_row(row) if filter.include?(row)
        ProgressBar.new(log, remote_file_name, data.size, index + 1).print if progress_bar
      end
    end
  end

  def zip_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STAR_ZIP_FILE')
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STAR_READING_IMPORT', nil)
  end

  def data_transformer
    StarReadingCsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def star_reading_assessment
    @assessment ||= Assessment.where(family: "STAR", subject: "Reading").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.find_by_local_id(row[:local_id])

    return if student.nil?

    star_assessment = StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment: star_reading_assessment
    }).first_or_create!

    star_assessment.update_attributes({
      percentile_rank: row[:percentile_rank],
      instructional_reading_level: row[:instructional_reading_level],
      grade_equivalent: row[:grade_equivalent]
    })
  end

  class HistoricalImporter < StarReadingImporter
    # STAR sends historical data in a separate file

    def remote_file_name
      'SR_Historical.csv'
    end
  end

  class RecentImporter < StarReadingImporter
    # STAR sends recent data in a separate file

    def remote_file_name
      "SomervillePublicSchools\ -\ Generic\ SR\ Extract.csv"
    end
  end

end
