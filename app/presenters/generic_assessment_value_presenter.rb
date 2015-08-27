class GenericAssessmentValuePresenter < Struct.new :student_assessment

  ATTRIBUTES_FOR_PRESENTATION = [
    'scale_score',
    'growth_percentile',
    'performance_level',
    'percentile_rank'
  ]

  ATTRIBUTES_FOR_PRESENTATION.each do |attribute|
    define_method attribute do
      handle_missing_student_assessment(student_assessment) do
        handle_missing_value student_assessment[attribute]
      end
    end
  end

  def handle_missing_value(value)
    value.present? ? value : "—"
  end

  def handle_missing_student_assessment(student_assessment)
    student_assessment.present? ? yield : "—"
  end

end
