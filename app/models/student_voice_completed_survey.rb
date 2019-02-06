# A survey that a student completed.
class StudentVoiceCompletedSurvey < ApplicationRecord
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

  # Take only the most recent survey from the most recent upload
  def self.most_recent_fall_student_voice_survey(student_id)
    most_recent_upload = StudentVoiceSurveyUpload
      .where(completed: true)
      .order(created_at: :desc)
      .limit(1)
      .first
    return nil if most_recent_upload.nil?

    most_recent_survey = most_recent_upload.student_voice_completed_surveys
      .where(student_id: student_id)
      .order(form_timestamp: :desc)
      .limit(1)
      .first
    return nil if most_recent_survey.nil?

    most_recent_survey
  end

  # Flatten into text, for displaying to the user
  def flat_text(options = {})
    columns = options.fetch(:columns, StudentVoiceCompletedSurvey.columns_for_form_v2)
    prompt_keys_to_include = options.fetch(:prompt_keys_to_include, columns.keys)

    lines = []
    prompt_keys_to_include.each do |prompt_key|
      prompt_text = columns[prompt_key]
      response_text = self[prompt_key]
      lines << "#{prompt_text}\n#{response_text}\n"
    end
    lines.join("\n").strip
  end
end
