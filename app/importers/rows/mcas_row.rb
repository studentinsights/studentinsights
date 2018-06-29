class McasRow < Struct.new :row, :student_id
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  VALID_MCAS_SUBJECTS = [ 'ELA', 'Mathematics' ].freeze

  class NullRow
    def save!; end
  end

  def self.build(row)
    new(row).build
  end

  def build
    return NullRow.new unless subject.in?(VALID_MCAS_SUBJECTS)

    student_assessment = StudentAssessment.find_or_initialize_by(
      student_id: student_id,
      assessment: assessment,
      date_taken: row[:assessment_date]
    )

    student_assessment.assign_attributes(
      scale_score: scale_score,
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )

    student_assessment
  end

  private

  def scale_score
    (row[:assessment_scale_score]).to_i
  end

  def subject
    if "English Language Arts".in?(row[:assessment_name])
      'ELA'
    else
      row[:assessment_subject]
    end
  end

  def family
    if scale_score.present? && scale_score > 399
      'Next Gen MCAS'
    else
      'MCAS'
    end
  end

  def assessment
    Assessment.find_or_create_by!(subject: subject, family: family)
  end

end
