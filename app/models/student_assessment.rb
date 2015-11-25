class StudentAssessment < ActiveRecord::Base
  include DateToSchoolYear
  include AssignToSchoolYear
  belongs_to :assessment
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken

  def self.latest
    order(date_taken: :desc)
  end

  def self.mcas_math
    joins(:assessment).where(assessments: {family: 'MCAS', subject: 'Math'})
  end

  def self.mcas_ela
    joins(:assessment).where(assessments: {family: 'MCAS', subject: 'ELA'})
  end

  def self.star_math
    joins(:assessment).where(assessments: {family: 'STAR', subject: 'Math'})
  end

  def self.star_reading
    joins(:assessment).where(assessments: {family: 'STAR', subject: 'Reading'})
  end

  def self.access
    joins(:assessment).where(assessments: {family: 'ACCESS'})
  end

  def self.first_or_missing
    first || MissingStudentAssessment.new
  end

  def risk_level
    return nil unless assessment.present? && family.present?
    case family
    when "MCAS"
      McasRiskLevel.new(self).risk_level
    when "STAR"
      StarRiskLevel.new(self).risk_level
    else
      nil
    end
  end

  def self.star
    joins(:assessment).where(assessments: {family: 'STAR'})
  end

  def self.map_test
    return MissingStudentAssessmentCollection.new if Assessment.map_test.is_a? MissingAssessment
    where(assessment_id: Assessment.map_test.id) || MissingStudentAssessmentCollection.new
  end

  def self.dibels
    return MissingStudentAssessmentCollection.new if Assessment.dibels.is_a? MissingAssessment
    where(assessment_id: Assessment.dibels.id) || MissingStudentAssessmentCollection.new
  end

  def self.math
    return MissingStudentAssessmentCollection.new if Assessment.math.is_a? MissingAssessment
    where(assessment_id: Assessment.math.id) || MissingStudentAssessmentCollection.new
  end

  def self.ela
    return MissingStudentAssessmentCollection.new if Assessment.ela.is_a? MissingAssessment
    where(assessment_id: Assessment.ela.id) || MissingStudentAssessmentCollection.new
  end

  def self.reading
    return MissingStudentAssessmentCollection.new if Assessment.reading.is_a? MissingAssessment
    where(assessment_id: Assessment.reading.id) || MissingStudentAssessmentCollection.new
  end

  def self.find_by_student(student)
    where(student_id: student.id)
  end

  def self.last_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc).last : MissingStudentAssessment.new
  end

  def self.order_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc) : MissingStudentAssessmentCollection.new
  end

end
