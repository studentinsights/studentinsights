class Section < ActiveRecord::Base
  validates :local_id, presence: true, uniqueness: { scope: [:local_id, :course_id, :school_id] }
  validates :school, presence: true
  validates :course, presence: true
  belongs_to :school
  belongs_to :course
end