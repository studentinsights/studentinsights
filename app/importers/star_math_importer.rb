class StarMathImporter
  include Connector
  include Importer

  def remote_file_name
    'SM.csv'
  end

  def data_transformer
    StarMathCsvTransformer.new
  end

  def assessment
    Assessment.where(family: "STAR", subject: "Math").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.where(local_id: row[:local_id]).first_or_create!

    star_assessment = StudentAssessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment_id: assessment.id
    }).first_or_create!

    star_assessment.update_attributes({percentile_rank: row[:percentile_rank]})
  end

  class HistoricalImporter < StarMathImporter
    # STAR sends historical data in a separate file

    def remote_file_name
      'SM_Historical.csv'
    end
  end

end
