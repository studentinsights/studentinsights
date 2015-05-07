class StarResultPresenter < Struct.new(:result)
  include ResultPresenter
  delegate :math_percentile_warning?, :reading_percentile_warning?, :date_taken, to: :result
  
  def results_for_presentation
    [
      :math_percentile_rank,
      :reading_percentile_rank,
      :instructional_reading_level
    ]
  end

end