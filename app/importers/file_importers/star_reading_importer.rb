class StarReadingImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'SR.csv'
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

    return if StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment: star_reading_assessment
    }).present?

    StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      percentile_rank: row[:percentile_rank],
      instructional_reading_level: row[:instructional_reading_level],
      assessment: star_reading_assessment
    }).create!
  end

  class HistoricalImporter < StarReadingImporter
    # STAR sends historical data in a separate file

    def remote_file_name
      'SR_Historical.csv'
    end
  end

end
