class X2AssessmentRow < Struct.new(:row)
  MCAS_SUBJECT_WHITELIST = ['Mathematics', 'ELA']

  def self.build(row)
    new(row).build
  end

  class NullRow
    def save!; end
  end

  def build
    return NullRow.new if family == 'MCAS' &&
                          !(row[:assessment_subject].in? MCAS_SUBJECT_WHITELIST)

    row[:assessment_test] = "ACCESS" if family == "WIDA-ACCESS"
    row[:assessment_growth] = nil if !/\D/.match(row[:assessment_growth]).nil?

    student_assessment = StudentAssessment.find_or_initialize_by(
      student: student,
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

  def student
    Student.find_by_local_id!(row[:local_id])
  end

  def family
    row[:assessment_test]
  end

  def assessment
    return Assessment.find_or_create_by!(family: family) if family == 'DIBELS'
    return Assessment.find_or_create_by!(subject: row[:assessment_subject], family: family)
  end

end
