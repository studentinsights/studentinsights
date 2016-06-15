module StudentsHelper

  def formatted_academic_assessment_score(student_assessment)
    case student_assessment.assessment.family
    when 'MCAS'
      "#{student_assessment.growth_percentile.try(:ordinalize) || 'Unknown'} growth percentile"
    when 'STAR'
      "#{student_assessment.percentile_rank.try(:ordinalize) || 'Unknown'} percentile"
    when 'DIBELS'
      student_assessment.performance_level
    else
      'Unknown'
    end
  end

end
