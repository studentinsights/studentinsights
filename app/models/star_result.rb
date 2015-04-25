class StarResult < ActiveRecord::Base
  belongs_to :student
  belongs_to :assessment

  def performance_warning_level
    34
  end

  # Warning flags for variables in roster view

  def math_warning?
    if math_percentile_rank.present?
      math_percentile_rank < performance_warning_level
    end
  end

  def reading_warning?
    if reading_percentile_rank.present?
      reading_percentile_rank < performance_warning_level
    end
  end
end
