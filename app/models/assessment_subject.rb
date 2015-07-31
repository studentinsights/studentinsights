class AssessmentSubject < ActiveRecord::Base
  has_many :assessments

  def self.math
    find_by_name("Math")
  end

  def self.ela
    find_by_name("ELA")
  end

  def self.reading
    find_by_name("Reading")
  end
end
