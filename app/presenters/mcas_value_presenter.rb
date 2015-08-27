class McasValuePresenter < Struct.new :mcas_student_assessment

  ATTRIBUTES_FOR_PRESENTATION = [
    'performance_level',
    'growth_percentile'
  ]

  ATTRIBUTES_FOR_PRESENTATION.each do |attribute|
    define_method attribute do
      handle_missing_student_assessment(mcas_student_assessment) do
        value = mcas_student_assessment[attribute]
        handle_missing_value(value) do
          case attribute
          when 'performance_level'
            performance_warning?(value) ? warning(value) : value
          when 'growth_percentile'
            growth_warning?(value) ? warning(value) : value
          else
            value
          end
        end
      end
    end
  end

  def handle_missing_value(value)
    value.present? ? yield : "—"
  end

  def handle_missing_student_assessment(student_assessment)
    student_assessment.present? ? yield : "—"
  end

  def warning(value)
    "<div class='warning-text'>#{value}</div>".html_safe
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
