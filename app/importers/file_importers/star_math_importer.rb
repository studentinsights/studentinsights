class StarMathImporter < BaseCsvImporter

  def remote_file_name
    "SomervillePublicSchools\ -\ Generic\ SM\ Pipeline\ Extract\ -\ Active.csv"
  end

  def data_transformer
    StarMathCsvTransformer.new
  end

  def star_mathematics_assessment
    @assessment ||= Assessment.where(family: "STAR", subject: "Mathematics").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.find_by_local_id(row[:local_id])

    return if student.nil?

    star_assessment = StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment: star_mathematics_assessment
    }).first_or_create!

    star_assessment.update_attributes({
      percentile_rank: row[:percentile_rank],
      grade_equivalent: row[:grade_equivalent]
    })
  end

  class HistoricalImporter < StarMathImporter
    # STAR sends historical data in a separate file

    def remote_file_name
      'SM_Historical.csv'
    end
  end

  class RecentImporter < StarMathImporter
    # STAR sends recent data in a separate file

    def remote_file_name
      "SomervillePublicSchools\ -\ Generic\ SM\ Extract.csv"
    end
  end

end
