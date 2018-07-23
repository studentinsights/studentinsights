class McasRow < Struct.new :row, :student_id, :assessments_array
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def build
    assessment_id = find_assessment_id
    return nil if assessment_id.nil?
    return nil unless subject.in?(Assessment::VALID_MCAS_SUBJECTS)

    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment_id: assessment_id,
      date_taken: row[:assessment_date]
    )

    student_assessment.assign_attributes(
      scale_score: row[:assessment_scale_score], # may be nil if "absent"
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )

    student_assessment
  end

  private

  def find_assessment_id
    assessments_array.find do |assessment|
      assessment.subject == subject && assessment.family == family
    end.try(:id)
  end

  def subject
    if "English Language Arts".in?(row[:assessment_name])
      'ELA'
    else
      row[:assessment_subject]
    end
  end

  # Next generation MCAS isn't tagged differently in the export, but the name has the year
  # and the score is on a different scale.
  def family
    if row[:assessment_scale_score].present? && row[:assessment_scale_score].to_i > 399
      'Next Gen MCAS'
    else
      'MCAS'
    end
  end
end
