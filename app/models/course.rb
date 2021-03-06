# Holds all-time list of courses.
# Record identity should be immutable, while values like `course_description` are
# mutable and reflect the value from the last export.
class Course < ApplicationRecord
  validates :course_number, presence: true, uniqueness: {
    # Different courses at different schools can have the same course number
    scope: [:course_number, :school_id]
  }
  validates :school, presence: true

  has_many :sections
  belongs_to :school
end
