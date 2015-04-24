class McasResultPresenter < Struct.new(:result)
  delegate :math_growth_warning?, :math_performance_warning?,
    :ela_performance_warning?, :ela_growth_warning?, to: :result

  def results_for_presentation
    [ 
      :math_performance,
      :ela_performance,
      :ela_growth, 
      :math_growth
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