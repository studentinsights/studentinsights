class StudentResult < ActiveRecord::Base
  belongs_to :student
  belongs_to :assessment

  def growth_warning_level
    34
  end

  def performance_warning_level
    ["W"] 
  end

  # Warning flags for variables in roster view

  def math_performance_warning?
    performance_warning_level.include? math_performance
  end

  def ela_performance_warning?
    performance_warning_level.include? ela_performance
  end

  def math_growth_warning?
    math_growth < growth_warning_level
  end

  def ela_growth_warning?
    ela_growth < growth_warning_level
  end

  def warning?
    math_performance_warning? || ela_performance_warning?
  end

end
