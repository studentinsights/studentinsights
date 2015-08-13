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
    return nil unless assessment_family.present?
    case assessment_family.name
    when "MCAS"
      McasRiskLevel.new(self).risk_level
    when "STAR"
      StarRiskLevel.new(self).risk_level
    else
      nil
    end
  end

  def self.mcas
    return MissingAssessmentCollection.new if AssessmentFamily.mcas.is_a? MissingAssessmentFamily
    where(assessment_family_id: AssessmentFamily.mcas.id)
  end

  def self.star
    return MissingAssessmentCollection.new if AssessmentFamily.star.is_a? MissingAssessmentFamily
    where(assessment_family_id: AssessmentFamily.star.id)
  end

  def self.map_test
    return MissingAssessmentCollection.new if AssessmentFamily.map_test.is_a? MissingAssessmentFamily
    where(assessment_family_id: AssessmentFamily.map_test.id)
  end

  def self.access
    return MissingAssessmentCollection.new if AssessmentFamily.access.is_a? MissingAssessmentFamily
    where(assessment_family_id: AssessmentFamily.access.id)
  end

  def self.dibels
    return MissingAssessmentCollection.new if AssessmentFamily.dibels.is_a? MissingAssessmentFamily
    where(assessment_family_id: AssessmentFamily.dibels.id)
  end

  def self.math
    return MissingAssessmentCollection.new if AssessmentSubject.math.is_a? MissingAssessmentSubject
    where(assessment_subject_id: AssessmentSubject.math.id)
  end

  def self.ela
    return MissingAssessmentCollection.new if AssessmentSubject.ela.is_a? MissingAssessmentSubject
    where(assessment_subject_id: AssessmentSubject.ela.id)
  end

  def self.reading
    return MissingAssessmentCollection.new if AssessmentSubject.reading.is_a? MissingAssessmentSubject
    where(assessment_subject_id: AssessmentSubject.reading.id)
  end

  def self.find_by_student(student)
    where(student_id: student.id)
  end

  def self.last_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc).last : MissingAssessment.new
  end

  def self.order_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc) : MissingAssessmentCollection.new
  end


end
