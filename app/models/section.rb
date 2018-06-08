class Section < ActiveRecord::Base
  validates :section_number, presence: true, uniqueness: {
    scope: [:section_number, :course_id, :term_local_id]
  }
  validates :course, presence: true
  belongs_to :course
  has_many :student_section_assignments
  has_many :students, through: :student_section_assignments
  has_many :educator_section_assignments
  has_many :educators, through: :educator_section_assignments

  def course_number
    course.course_number
  end

  def course_description
    course.course_description
  end
end
