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
      errors.add(:percentile_rank, "invalid") unless valid_star_attributes?

      # TODO: Add validation for STAR grade_equivalent field.
      # This should be present for all STAR records, but because this wasn't
      # backfilled to older records, ~40% of STAR records in the Somerville
      # production database have grade_equivalent of nil.

      if assessment.subject == 'Reading' && !valid_star_reading_attributes?
        errors.add(:instructional_reading_level, "invalid")
      end
    end

    # TODO: Add validation for MCAS, DIBELS, and ACCESS assessments.
  end

  def valid_star_attributes?
    percentile_rank.present? &&
      scale_score.nil? &&
      growth_percentile.nil? &&
      performance_level.nil?
  end

  def valid_star_reading_attributes?
    instructional_reading_level.present?
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
