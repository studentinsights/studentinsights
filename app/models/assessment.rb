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
    where(assessment_family_id: AssessmentFamily.mcas.id)
  end

  def self.star
    where(assessment_family_id: AssessmentFamily.star.id)
  end

  def self.math
    where(assessment_subject_id: AssessmentSubject.math.id)
  end

  def self.ela
    where(assessment_subject_id: AssessmentSubject.ela.id)
  end

  def self.reading
    where(assessment_subject_id: AssessmentSubject.reading.id)
  end

  def self.last
    order(date_taken: :asc).present? ? order(date_taken: :asc).last : MissingAssessment.new
  end

end
