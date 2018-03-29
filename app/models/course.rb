class Course < ActiveRecord::Base
  validates :course_number, presence: true, uniqueness: { scope: [:course_number, :school_id] }
  validates :school, presence: true
  has_many :sections
  belongs_to :school
end
