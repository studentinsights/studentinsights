class McasRow < Struct.new :row, :student_id, :assessments_array
  def build
    assessment_id = find_assessment_id(row)
    return nil if assessment_id.nil?

    date_taken = PerDistrict.new.parse_date_during_import(row[:assessment_date])
    return nil if date_taken.nil?

    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment_id: assessment_id,
      date_taken: date_taken
    )

    student_assessment.assign_attributes(
      scale_score: row[:assessment_scale_score], # may be nil if "absent"
      performance_level: row[:assessment_performance_level],
      growth_percentile: parse_growth_percentile(row[:assessment_growth])
    )

    student_assessment
  end

  private
  def find_assessment_id(row)
    family = normalized_family(row)
    return nil unless family.in?(Assessment::VALID_FAMILY_VALUES)

    subject = normalized_subject(row)
    return nil unless subject.in?(Assessment::VALID_MCAS_SUBJECTS)

    assessments_array.find do |assessment|
      assessment.subject == subject && assessment.family == family
    end.try(:id)
  end

  # Next generation MCAS isn't tagged differently in the export, but the score is on a different
  # scale so we can infer from that.
  def normalized_family(row)
    if row[:assessment_scale_score].present? && row[:assessment_scale_score].to_i > 399
      'Next Gen MCAS'
    else
      'MCAS'
    end
  end

  # Map from district to Insights subject name
  def normalized_subject(row)
    PerDistrict.new.normalized_subject_from_mcas_export(row)
  end

  # Missing or unparseable values are ignored and converted to nil
  def parse_growth_percentile(value)
    if value.nil? || value.to_i == 0 then nil else value.to_i end
  end
end
