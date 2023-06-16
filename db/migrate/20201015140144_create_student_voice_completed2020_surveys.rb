class CreateStudentVoiceCompleted2020Surveys < ActiveRecord::Migration[6.0]
  def change
    create_table :student_voice_completed2020_surveys do |t|
      t.integer :student_voice_survey_upload_id, null: false
      t.integer :student_id, null: false

      t.datetime :form_timestamp, null: false
      t.text :student_lasid, null: false
      t.text :shs_adult, null: false
      t.text :mentor_schedule, null: false
      t.text :guardian_email, null: false
      t.text :guardian_numbers, null: false
      t.text :home_language, null: false
      t.text :pronouns, null: false
      t.text :share_pronouns_with_family, null: false
      t.text :job, null: false
      t.text :job_hours, null: false
      t.text :sibling_care, null: false
      t.text :sibling_care_time, null: false
      t.text :remote_learning_difficulties, null: false
      t.text :reliable_internet, null: false
      t.text :devices, null: false
      t.text :sharing_space, null: false
      t.text :remote_learning_likes, null: false
      t.text :remote_learning_struggles, null: false
      t.text :camera_comfort, null: false
      t.text :camera_comfort_reasons, null: false
      t.text :mic_comfort, null: false
      t.text :mic_comfort_reasons, null: false
      t.text :learning_style, null: false
      t.text :outside_school_activity, null: false
      t.text :personal_characteristics, null: false
      t.text :three_words, null: false
      t.text :other_share
      
      t.timestamps
    end

    add_foreign_key :student_voice_completed2020_surveys, :students,
      name: 'student_voice_completed_surveys_for_student_id_fk'

    add_foreign_key :student_voice_completed2020_surveys, :student_voice_survey_uploads,
      name: 'student_voice_completed_surveys_for_student_voice_survey_upload'
  end
end
