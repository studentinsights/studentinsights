class AssessmentFamily < ActiveRecord::Base
  has_many :student_assessments

  def self.mcas
    find_by_name("MCAS") || MissingAssessmentFamily.new
  end

  def self.star
    find_by_name("STAR") || MissingAssessmentFamily.new
  end

  def self.map_test
    find_by_name("MAP") || MissingAssessmentFamily.new
  end

  def self.dibels
    find_by_name("DIBELS") || MissingAssessmentFamily.new
  end

  def self.access
    find_by_name("ACCESS") || MissingAssessmentFamily.new
  end

end
