class StudentAssessmentPresenter < Struct.new :student_assessment

  ATTRIBUTES_FOR_PRESENTATION = [
    'performance_level',
    'scale_score',
    'growth_percentile',
    'percentile_rank',
    'instructional_reading_level'
  ]

  ATTRIBUTES_FOR_PRESENTATION.each do |attribute|
    define_method attribute do
      handle_none student_assessment.send(attribute)
    end
  end

  def handle_none(value)
    value.present? ? value : "—"
  end

end
