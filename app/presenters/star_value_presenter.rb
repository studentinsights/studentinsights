class StarValuePresenter < Struct.new :star_student_assessment

  def percentile_rank
    return '–' if star_student_assessment.blank?
    return '–' if star_student_assessment['percentile_rank'].blank?
    warning = percentile_warning?(star_student_assessment['percentile_rank'])
    if warning
      "<div class='warning-text'>#{star_student_assessment['percentile_rank']}</div>".html_safe
    else
      star_student_assessment['percentile_rank']
    end
  end

  def instructional_reading_level
    return '–' if star_student_assessment.blank?
    return '–' if star_student_assessment['instructional_reading_level'].blank?
    star_student_assessment['instructional_reading_level']
  end

  def percentile_warning_level
    40
  end

  def percentile_warning?(percentile_rank)
    percentile_rank.to_i < percentile_warning_level
  end

  # def level_warning?
  #   if instructional_reading_level.present?
  #     -1 >= instructional_reading_level.to_f - grade.to_f
  #   end
  # end

end
