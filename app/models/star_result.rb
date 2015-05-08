class StarResult < ActiveRecord::Base
  belongs_to :student

  def percentile_warning_level
    40
  end

  # Warning flags for variables in roster view
  def math_percentile_warning?
    if math_percentile_rank.present?
      math_percentile_rank < percentile_warning_level
    end
  end

  def reading_percentile_warning?
    if reading_percentile_rank.present?
      reading_percentile_rank < percentile_warning_level
    end
  end

  def reading_level_warning?
    if instructional_reading_level.present?
      -1 >= instructional_reading_level.to_f - grade.to_f
    end
  end
end
