class GenericAssessmentValuePresenter < Struct.new :student_assessment

  def scale_score
    return '–' if student_assessment.blank?
    return '–' if student_assessment['scale_score'].blank?
    student_assessment['scale_score']
  end

  def growth_percentile
    return '–' if student_assessment.blank?
    return '–' if student_assessment['scale_score'].blank?
    student_assessment['growth_percentile']
  end

  def performance_level
    return '–' if student_assessment.blank?
    return '–' if student_assessment['scale_score'].blank?
    student_assessment['performance_level']
  end

  def percentile_rank
    return '–' if student_assessment.blank?
    return '–' if student_assessment['scale_score'].blank?
    student_assessment['percentile_rank']
  end

end
