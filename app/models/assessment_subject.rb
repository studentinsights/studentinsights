class AssessmentSubject < ActiveRecord::Base
  has_many :student_assessments

  def self.math
    find_by_name("Math") || MissingAssessmentSubject.new
  end

  def self.ela
    find_by_name("ELA") || MissingAssessmentSubject.new
  end

  def self.reading
    find_by_name("Reading") || MissingAssessmentSubject.new
  end
end
