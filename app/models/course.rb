class Course < ActiveRecord::Base
  validates :course_number, presence: true, uniqueness: {
    # Different courses at different schools can have the same course number
    scope: [:course_number, :school_id]
  }
  validates :school, presence: true
  has_many :sections
  belongs_to :school
end
