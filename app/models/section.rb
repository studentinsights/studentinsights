# Holds all-time list of sections, scoped by `district_school_year`
#
# Record identity should be immutable, while values like `schedule` are mutable and
# reflect the value from the last export.
class Section < ApplicationRecord
  # Exclude term values that are empty strings
  VALID_TERM_VALUES = [
    '9', 'FY', # all year
    '1', 'S1', 'Q1', 'Q2', # first semester or first two quarters
    '2', 'S2', 'Q3', 'Q4' # second semester of last two quarters
  ]

  belongs_to :course
  has_many :student_section_assignments
  has_many :students, through: :student_section_assignments
  has_many :educator_section_assignments
  has_many :educators, through: :educator_section_assignments

  validates :section_number, presence: true, uniqueness: {
    scope: [:course_id, :district_school_year, :term_local_id, :section_number]
  }
  validates :course, presence: true
  validates :section_number, presence: true
  validates :term_local_id, inclusion: { in: VALID_TERM_VALUES }

  def course_number
    course.course_number
  end

  def course_description
    course.course_description
  end

  # In Somerville's SIS, the `district_school_year` or `CTX_SCHOOL_YEAR`
  # field uses the end of the school year (eg, 2019-2020 is "2020").
  # Within Student Insights, we use the first part of the school year (eg, 2019-2020
  # is "2019").
  def to_insights_school_year
    return nil if district_school_year.nil?
    district_school_year - 1
  end

  def self.to_district_school_year(insights_school_year)
    insights_school_year + 1
  end
end
