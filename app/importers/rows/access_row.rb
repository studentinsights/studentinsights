class AccessRow < Struct.new :row, :student_id, :assessment_finder
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def build
    assessment_id = assessment_finder.find_or_create_assessment_id(family: 'ACCESS', subject: subject)
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
  def subject
    return 'Composite' if row[:assessment_subject] == 'Overall'
    row[:assessment_subject]
  end
end
