# A student's attendance at a homework help session
class HomeworkHelpSession < ApplicationRecord
  belongs_to :student

  validates :student, presence: true
  validates :form_timestamp, presence: true
  validates :course_ids, presence: true

  def courses
    Course.where(id: course_ids)
  end
end
