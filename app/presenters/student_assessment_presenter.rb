class StudentAssessmentPresenter < Struct.new :assessment

  def results_for_presentation
    [
      :performance_level,
      :scale_score,
      :growth_percentile,
      :percentile_rank,
      :instructional_reading_level
    ]
  end

  def method_missing(m, *args, &block)
    if results_for_presentation.include? m
      assessment.send(m).present? ? assessment.send(m) : "—"
    else
      raise NoMethodError
    end
  end

end
