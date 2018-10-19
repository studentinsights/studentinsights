class StudentSectionAssignment < ApplicationRecord
  belongs_to :student
  belongs_to :section
  validates :student_id, presence: true
  validates :section_id, presence: true

  def self.store_change!(syncer_key, student_section_assignment)
    StudentSectionChange.create!({
      # valid data
      syncer_key: syncer_key,
      student_id: student_section_assignment.student_id,

      # denormalized historical data
      # any keys here are not guaranteed to be valid during future reads
      student_section_assignment_json: student_section_assignment.as_json,
      section_json: student_section_assignment.section.as_json,
      course_json: student_section_assignment.section.course.as_json,
      student_json: student_section_assignment.student.as_json
    })
  end
end
