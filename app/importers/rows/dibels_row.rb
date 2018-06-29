class DibelsRow < Struct.new :row, :student_id
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def self.build(row)
    new(row).build
  end

  def build
    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment: assessment,
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

  def assessment
    Assessment.find_or_create_by!(family: 'DIBELS')
  end

end
