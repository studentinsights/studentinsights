class StudentProfileCsvStudentAssessmentSection < Struct.new :csv, :assessment_results, :title_row, :headers_row, :scores

  def add
    return if assessment_results.blank?
    csv << title_row
    csv << headers_row
    assessment_results.each do |result|
      csv << scores.map { |s| result.send(s) }
    end
    csv << []
  end

end
