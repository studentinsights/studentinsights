# typed: ignore
class AccessRow < Struct.new :row, :student_id, :assessments_array
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def build
    assessment_id = find_assessment_id
    return nil if assessment_id.nil?

    date_taken = PerDistrict.new.parse_date_during_import(row[:assessment_date])
    return nil if date_taken.nil?

    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment_id: assessment_id,
      date_taken: date_taken
    )

    student_assessment.assign_attributes(
      scale_score: parse_or_nil(row[:assessment_scale_score]),
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )

    student_assessment
  end

  private

  def find_assessment_id
    assessments_array.find do |assessment|
      assessment.subject == subject && assessment.family == 'ACCESS'
    end.try(:id)
  end

  def subject
    return 'Composite' if row[:assessment_subject] == 'Overall'
    row[:assessment_subject]
  end

  # Missing or unparseable values are ignored and converted to nil
  def parse_or_nil(value)
    if value.nil? || value.to_i == 0 then nil else value.to_i end
  end
end
