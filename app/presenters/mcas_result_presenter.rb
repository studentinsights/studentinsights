class McasResultPresenter < Struct.new(:result)

  def math_performance
    result.math_performance.present? ? result.math_performance : "—"
  end

  def ela_performance
    result.ela_performance.present? ? result.ela_performance : "—"
  end

  def ela_growth
    result.ela_growth.present? ? result.ela_growth : "—"
  end

  def math_growth
    result.math_growth.present? ? result.math_growth : "—"
  end

  def math_growth_warning?
    result.math_growth_warning?
  end

  def math_performance_warning?
    result.math_performance_warning?
  end

  def ela_performance_warning?
    result.ela_performance_warning?
  end

  def ela_growth_warning?
    result.ela_growth_warning?
  end
  
end