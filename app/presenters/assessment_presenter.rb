class AssessmentPresenter < Struct.new :assessment
  # delegate :percentile_warning?,
  #   :reading_level_warning?, :date_taken, to: :assessment

  def results_for_presentation
    [
      :percentile_rank,
      :scale_score,
      :growth_percentile,
      :performance_level,
      :instructional_reading_level
    ]
  end

  def method_missing(m, *args, &block)
    if results_for_presentation.include? m
      result.send(m).present? ? result.send(m) : "—"
    else
      raise NoMethodError
    end
  end

end
