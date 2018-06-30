
class DibelsRow < Struct.new :row, :student_id, :assessments_array
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def build
    assessment_id = find_assessment_id
    return nil if assessment_id.nil?

    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment_id: assessment_id,
      date_taken: row[:assessment_date]
    )

    student_assessment.assign_attributes(
      scale_score: row[:assessment_scale_score],
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )

    student_assessment
  end

  private
  def find_assessment_id
    assessments_array.find { |assessment| assessment.family == 'DIBELS' }.try(:id)
  end
end
