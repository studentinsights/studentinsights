class Tardy < ActiveRecord::Base
  belongs_to :student

  validates :student, presence: true
  validates :occurred_at, presence: true, uniqueness: { scope: [:student_id] }
end
