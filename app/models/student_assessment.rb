class StudentAssessment < ActiveRecord::Base
  belongs_to :assessment
  belongs_to :student
  belongs_to :school_year
  belongs_to :student_school_year
  before_save :assign_to_school_year
  after_create :assign_to_student_school_year
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken, :student, :assessment
  validate :valid_assessment_attributes

  def valid_assessment_attributes
    case assessment.family
    when 'MCAS'
      scale_score.present? &&
      growth_percentile.present? &&
      performance_level.present? &&
      percentile_rank.nil?
    when 'STAR'
      percentile_rank.present? &&
      scale_score.nil? &&
      growth_percentile.nil? &&
      performance_level.nil?
    when 'DIBELS'
      performance_level.present? &&
      percentile_rank.nil? &&
      scale_score.nil? &&
      growth_percentile.nil?
    end
  end

  def assign_to_school_year
    self.school_year = DateToSchoolYear.new(date_taken).convert
  end

  def assign_to_student_school_year
    self.student_school_year = StudentSchoolYear.where({
      student_id: student.id, school_year_id: school_year.id
    }).first_or_create!
    save
  end

  def self.order_by_date_taken_desc
    order(date_taken: :desc)
  end

  def self.order_by_date_taken_asc
    order(date_taken: :asc)
  end

  def self.by_family(family_name)
    joins(:assessment).where(assessments: {family: family_name})
  end

  def self.by_family_and_subject(family_name, subject_name)
    joins(:assessment).where(assessments: {family: family_name, subject: subject_name})
  end

  def self.find_by_student(student)
    where(student_id: student.id)
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
