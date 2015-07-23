class StarResult < ActiveRecord::Base
  include DateToSchoolYear
  include AssignToSchoolYear
  belongs_to :student
  belongs_to :school_year
  delegate :grade, to: :student
  before_save :assign_to_school_year

  def risk_level_3_cutoff; 10 end
  def risk_level_2_cutoff; 30 end
  def risk_level_0_cutoff; 85 end
  def percentile_warning_level; 40 end

  def risk_level
    if math_risk_level.present? && reading_risk_level.present?
      if reading_risk_level > math_risk_level
        reading_risk_level
      else
        math_risk_level
      end
    elsif math_risk_level.nil? && reading_risk_level.nil?
      nil
    else
      math_risk_level || reading_risk_level
    end
  end

  def math_risk_level
    if math_percentile_rank.present?
      if math_percentile_rank < risk_level_3_cutoff
        3
      elsif math_percentile_rank < risk_level_2_cutoff
        2
      elsif math_percentile_rank > risk_level_0_cutoff
        0
      else
        1
      end
    end
  end

  def reading_risk_level
    if reading_percentile_rank.present?
      if reading_percentile_rank < risk_level_3_cutoff
        3
      elsif reading_percentile_rank < risk_level_2_cutoff
        2
      elsif reading_percentile_rank > risk_level_0_cutoff
        0
      else
        1
      end
    end
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
