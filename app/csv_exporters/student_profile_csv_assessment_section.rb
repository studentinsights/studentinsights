class StudentProfileCsvAssessmentSection < Struct.new :csv, :assessment_results, :title_row, :headers_row, :scores

  def add
    return unless assessment_results.present?
    csv << title_row
    csv << headers_row
    assessment_results.each do |result|
      csv << scores.map { |s| result.send(s) }
    end
    csv << []
  end

end
