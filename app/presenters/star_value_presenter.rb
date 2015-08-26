class StarValuePresenter < Struct.new :star_student_assessment

  ATTRIBUTES_FOR_PRESENTATION = [
    'percentile_rank',
    'instructional_reading_level'
  ]

  ATTRIBUTES_FOR_PRESENTATION.each do |attribute|
    define_method attribute do
      handle_missing_student_assessment(star_student_assessment) do
        value = star_student_assessment[attribute]
        handle_missing_value(value) do
          case attribute
          when 'percentile_rank'
            percentile_warning?(value) ? warning(value) : value
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
