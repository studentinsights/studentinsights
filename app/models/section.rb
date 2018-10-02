class Section < ActiveRecord::Base
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
    scope: [:section_number, :course_id, :term_local_id]
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
end
