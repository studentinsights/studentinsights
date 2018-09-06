# A survey that a student completed.
class StudentVoiceCompletedSurvey < ActiveRecord::Base
  belongs_to :student
  belongs_to :student_voice_survey_upload

  validates :student, presence: true
  validates :student_voice_survey_upload, presence: true

  # added 9/6/2018
  def self.columns_for_form_v2
    {
      form_timestamp: "Timestamp",
      first_name: "First name",
      student_lasid: "Local ID number", # this line is the diff
      proud: "I am proud that I....",
      best_qualities: "My best qualities are....",
      activities_and_interests: "My activities and interests outside of school are....",
      nervous_or_stressed: "I get nervous or stressed in school when....",
      learn_best: "I learn best when my teachers...."
    }
  end

  def self.columns_for_form_v1_deprecated
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
