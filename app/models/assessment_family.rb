class AssessmentFamily < ActiveRecord::Base
  has_many :assessments

  def self.mcas
    find_by_name("MCAS")
  end

  def self.star
    find_by_name("STAR")
  end

end
