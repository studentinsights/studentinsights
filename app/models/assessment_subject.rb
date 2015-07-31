class AssessmentSubject < ActiveRecord::Base
  has_many :assessments

  def math
    find_by_name("Math")
  end

  def ela
    find_by_name("ELA")
  end

  def reading
    find_by_name("Reading")
  end
end
