class StarResultPresenter < Struct.new(:result)

  def math_percentile_rank
    result.math_percentile_rank.present? ? result.math_percentile_rank : "—"
  end

  def reading_percentile_rank
    result.reading_percentile_rank.present? ? result.reading_percentile_rank : "—"
  end

  def instructional_reading_level
    result.instructional_reading_level.present? ? result.instructional_reading_level : "—"
  end

  def math_warning?
    result.math_warning?
  end

  def reading_warning?
    result.reading_warning?
  end
  
end