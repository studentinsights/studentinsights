class Assessment < ActiveRecord::Base
  include DateToSchoolYear
  include AssignToSchoolYear
  belongs_to :assessment_family
  belongs_to :assessment_subject
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  delegate :grade, to: :student

  def risk_level
    case assessment_family.name
    when "MCAS"
      McasRiskLevel.new(self).risk_level
    when "STAR"
      StarRiskLevel.new(self).risk_level
    else
      nil
    end
  end
end
