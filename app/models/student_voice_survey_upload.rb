class StudentVoiceSurveyUpload < ActiveRecord::Base
  belongs_to :student
  belongs_to :uploaded_by_educator, class_name: 'Educator'

  validates :form_timestamp, presence: true
  validates :first_name, presence: true
  validates :student_lasid, presence: true
  validates :proud, presence: true
  validates :best_qualities, presence: true
  validates :activities_and_interests, presence: true
  validates :nervous_or_stressed, presence: true
  validates :learn_best, presence: true

  validates :student, presence: true
  validates :uploaded_by_educator, presence: true
  validates :file_name, presence: true

  def column_keys_for_form_v1
    [
      "Timestamp",
      "First name",
      "ID number that starts with 111....",
      "I am proud that I....",
      "My best qualities are....",
      "My activities and interests outside of school are....",
      "I get nervous or stressed in school when....",
      "I learn best when my teachers...."
    ]
  end
end
