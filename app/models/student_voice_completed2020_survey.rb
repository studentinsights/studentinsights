# Student Voice Surveys for 2020 including remote learning information
class StudentVoiceCompleted2020Survey < ApplicationRecord
  belongs_to :student
  belongs_to :student_voice_survey_upload

  validates :student, presence: true
  validates :student_voice_survey_upload, presence: true
  validates :form_timestamp, presence: true

  # added 10/2020
  # includes information for remote learning
  def self.columns_for_form_2020
    {
      form_timestamp: "Timestamp",
      student_lasid: "Your Student ID Number (the 111....number)",
      shs_adult: "Is there an adult at SHS you can reach out to if there are any issues? (ex. If you were having an issue with your schoolwork or something else happening at school, who would you feel comfortable reaching out to....) ",
      mentor_schedule: "I would like to meet with my mentor...",
      guardian_email: "What is your parent/guardian's email? (can provide multiple)",
      guardian_numbers: "What is your parent/guardian's phone number? (can provide multiple) For example, mom 617-542-4257 and uncle 617-542-7542",
      home_language: "What is the preferred language for at home communication?",
      pronouns: "Which pronouns do you identify with?",
      share_pronouns_with_family: "Are you comfortable with your teachers, Dean, + Assistant Principal using these pronouns when communicating with your family? ",
      job: "Do you have a job?",
      job_hours: "If yes, what hours do you work?",
      sibling_care: "Do you care for siblings?",
      sibling_care_time: "If yes, what time of day?",
      remote_learning_difficulties: "Do you have other circumstances that make remote learning difficult?",
      reliable_internet: "Do you have reliable internet?",
      devices: "What devices do you have access too? (check all that apply)",
      sharing_space: "Are you sharing your remote learning space with other people (siblings, relatives, guardians, etc.)?",
      remote_learning_likes: "What did you like best about remote learning thus far?",
      remote_learning_struggles: "What have you struggled with the most during remote learning thus far?",
      camera_comfort: "Do you feel comfortable turning your camera on during class?",
      camera_comfort_reasons: "If no, for what reasons?",
      mic_comfort: "Do you feel comfortable turning your mic on during class?",
      mic_comfort_reasons: "If no, for what reasons?",
      learning_style: "What is your preferred learning style? (check all that apply)",
      outside_school_activity: "What do you like to do outside of school hours?",
      personal_characteristics: "What characteristics about yourself do you love the most?",
      three_words: "If you could describe yourself in 3 words, what would they be?",
      other_share: "Is there anything else you want to share with us?"
    }
  end

  # Take only the most recent survey from the most recent upload
  # Right now this can return an instance of StudentVoiceCompletedSurvey (not 2020 specific)
  # TODO add boolean check in studentvoicesurveyupload to return only 2020
  def self.most_recent_fall_student_voice_survey(student_id)
    most_recent_upload = StudentVoiceSurveyUpload
      .where(completed: true)
      .order(created_at: :desc)
      .limit(1)
      .first
    return nil if most_recent_upload.nil?

    most_recent_survey = most_recent_upload.student_voice_completed2020_surveys
      .where(student_id: student_id)
      .order(form_timestamp: :desc)
      .limit(1)
      .first
    return nil if most_recent_survey.nil?

    most_recent_survey
  end

  # Flatten into text, for displaying to the user
  def flat_text(options = {})
    columns = options.fetch(:columns, StudentVoiceCompleted2020Survey.columns_for_form_2020)
    prompt_keys_to_include = options.fetch(:prompt_keys_to_include, [
      :learning_style,
      :outside_school_activity,
      :personal_characteristics,
      :three_words
    ])

    lines = []
    prompt_keys_to_include.each do |prompt_key|
      prompt_text = columns[prompt_key]
      response_text = self[prompt_key]
      lines << "#{prompt_text}\n#{response_text}\n"
    end
    lines.join("\n").strip
  end

  # workaround to send remote learning columns using as_jason since we can't send
  # params with the flat_text method
  def flat_text_remote
    remote_keys = [
      :guardian_email,
      :guardian_numbers,
      :home_language,
      :pronouns,
      :share_pronouns_with_family,
      :job,
      :job_hours,
      :sibling_care,
      :sibling_care_time,
      :remote_learning_difficulties,
      :reliable_internet,
      :devices,
      :sharing_space,
      :remote_learning_likes,
      :remote_learning_struggles,
      :camera_comfort,
      :camera_comfort_reasons,
      :mic_comfort,
      :mic_comfort_reasons
    ]

    flat_text(prompt_keys_to_include: remote_keys)
  end

end
