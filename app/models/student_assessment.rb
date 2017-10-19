class StudentAssessment < ActiveRecord::Base
  belongs_to :assessment
  belongs_to :student
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken, :student, :assessment
  validates :student, uniqueness: { scope: [:assessment_id, :date_taken] }
  validate :valid_assessment_attributes

  def valid_assessment_attributes
    case assessment.family
    when 'MCAS'
      # errors.add(:scale_score, "invalid attributes") unless valid_mcas_attributes
    when 'STAR'
      # errors.add(:scale_score, "invalid attributes") unless valid_star_attributes
    when 'DIBELS'
      # errors.add(:scale_score, "invalid attributes") unless valid_dibels_attributes
    end
  end

  def valid_mcas_attributes
    scale_score.present? &&
    growth_percentile.present? &&
    performance_level.present? &&
    percentile_rank.nil?
  end

  def valid_star_attributes
    percentile_rank.present? &&
    scale_score.nil? &&
    growth_percentile.nil? &&
    performance_level.nil?
  end

  def valid_dibels_attributes
    performance_level.present? &&
    percentile_rank.nil? &&
    scale_score.nil? &&
    growth_percentile.nil?
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

  def self.by_family_and_subject(family:, subject:, flavor: 'Regular')
    joins(:assessment).where(assessments: {
      family: family, subject: subject, flavor: flavor
    })
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
