class McasValuePresenter < Struct.new :mcas_student_assessment

  def performance_level
    return '–' if mcas_student_assessment.blank?
    return '–' if mcas_student_assessment['performance_level'].blank?
    warning = performance_warning?(mcas_student_assessment['performance_level'])
    if warning
      "<div class='warning-text'>#{mcas_student_assessment['performance_level']}</div>".html_safe
    else
      mcas_student_assessment['performance_level']
    end
  end

  def growth_percentile
    return '–' if mcas_student_assessment.blank?
    return '–' if mcas_student_assessment['growth_percentile'].blank?
    warning = growth_warning?(mcas_student_assessment['growth_percentile'])
    if warning
      "<div class='warning-text'>#{mcas_student_assessment['growth_percentile']}</div>".html_safe
    else
      mcas_student_assessment['growth_percentile']
    end
  end

  def performance_warning_level
    ["W"]
  end

  def growth_warning_level
    40
  end

  def performance_warning?(performance_level)
    performance_warning_level.include? performance_level
  end

  def growth_warning?(growth_percentile)
    growth_percentile.to_i < growth_warning_level
  end

end
