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

  def self.columns_for_form_v1
    {
      form_timestamp: "Timestamp",
      first_name: "First name",
      student_lasid: "ID number that starts with 111....",
      proud: "I am proud that I....",
      best_qualities: "My best qualities are....",
      activities_and_interests: "My activities and interests outside of school are....",
      nervous_or_stressed: "I get nervous or stressed in school when....",
      learn_best: "I learn best when my teachers...."
    }
  end
end
