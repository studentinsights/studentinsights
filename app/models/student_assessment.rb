# NOTE: Right now, this single model holds data forboth  MCAS and ACCESS.
# Over time, we want to create a separate model
# and table for each assessment. Each assessment has its own unique fields.
# Breaking them into separate tables will let us add database-level validations.

# IN PROGRESS: Migrating student assessment data out of this model.
# First assessments to migrate out were STAR and DIBELS.

class StudentAssessment < ApplicationRecord
  belongs_to :assessment
  belongs_to :student
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken, :student, :assessment
  validates :student, uniqueness: { scope: [:assessment_id, :date_taken] }

  # Guard against sloppy type coercion
  validates :growth_percentile, exclusion: { in: [0]}
  validates :scale_score, exclusion: { in: [0]}
  validates :percentile_rank, exclusion: { in: [0]}

  # TODO: Add validation for MCAS and ACCESS assessments.

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
