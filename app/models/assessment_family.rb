class AssessmentFamily < ActiveRecord::Base
  has_many :assessments

  def self.mcas
    find_by_name("MCAS") || MissingAssessmentFamily.new
  end

  def self.star
    find_by_name("STAR") || MissingAssessmentFamily.new
  end

end
