class StudentSectionAssignment < ApplicationRecord
  belongs_to :student
  belongs_to :section
  validates :student_id, presence: true
  validates :section_id, presence: true
end
