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
    when 'STAR'
      errors.add(:scale_score, "invalid attributes") unless valid_star_attributes
    when 'MCAS'
      errors.add(:scale_score, "invalid attributes") unless valid_mcas_attributes
    when 'DIBELS'
      errors.add(:scale_score, "invalid attributes") unless valid_dibels_attributes
    end
  end

  def valid_star_attributes
    percentile_rank.present? &&
    scale_score.nil? &&
    growth_percentile.nil? &&
    performance_level.nil?
  end

  def valid_mcas_attributes
    # Looking at the data exports from Somerville (7/18), we see that:
    # * Around 40% of MCAS rows have no growth percentile.
    # * Around 5% of MCAS rows have no scale score.
    # * Only one otherwise-valid row has no performance level.

    performance_level.present? && percentile_rank.nil?
  end

  def valid_dibels_attributes
    # Looking at the data exports from Somerville (7/18), we see that:
    # * Around 0.05% of DIBELS rows have no performance level.

    # Performance level is the only DIBELS field we visualize in the product.
    performance_level.present?
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

end
