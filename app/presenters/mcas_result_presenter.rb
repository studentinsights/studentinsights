class McasResultPresenter < Struct.new(:result)
  include ResultPresenter
  delegate :math_growth_warning?, :math_performance_warning?, :ela_performance_warning?, 
  :ela_growth_warning?, :date_taken, to: :result
  
  def results_for_presentation
    [ 
      :math_performance,
      :ela_performance,
      :ela_growth, 
      :math_growth
    ]
  end

end