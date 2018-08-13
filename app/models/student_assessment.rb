# NOTE: Right now, this single model holds data forboth  MCAS and ACCESS.
# Over time, we want to create a separate model
# and table for each assessment. Each assessment has its own unique fields.
# Breaking them into separate tables will let us add database-level validations.

# IN PROGRESS: Migrating student assessment data out of this model.
# First assessments to migrate out were STAR and DIBELS.

class StudentAssessment < ActiveRecord::Base
  belongs_to :assessment
  belongs_to :student
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student
  validates_presence_of :date_taken, :student, :assessment
  validates :student, uniqueness: { scope: [:assessment_id, :date_taken] }

  # Notes on data quality for MCAS:
    # Looking at Somerville raw data July 2018:
    #   * ~40% of rows have no growth percentile.
    #   * ~5% of rows have no scale score.
    #   * Almost all rows have performance level (only 1 exception).
    # Looking at New Bedford raw data July 2018:
    #   * Zero rows have growth percentile.
    #   * 33% of rows have no scale score.
    #   * 16% of rows have no performance level.

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
