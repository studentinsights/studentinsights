class StudentAssessment < ActiveRecord::Base
  belongs_to :assessment
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken

  def assign_to_school_year
    self.school_year = DateToSchoolYear.new(date_taken).convert
  end

  def self.latest
    order(date_taken: :desc)
  end

  def self.by_family(family_name)
    joins(:assessment).where(assessments: {family: family_name})
  end

  def self.by_family_and_subject(family_name, subject_name)
    joins(:assessment).where(assessments: {family: family_name, subject: subject_name})
  end

  def self.first_or_missing
    first || MissingStudentAssessment.new
  end

  def self.order_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc) : MissingStudentAssessmentCollection.new
  end

  def self.find_by_student(student)
    where(student_id: student.id)
  end

  def self.last_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc).last : MissingStudentAssessment.new
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

end
