class AddStudentVoiceSurveyUpload < ActiveRecord::Migration[5.2]
  def change
    create_table :student_voice_survey_uploads do |t|
      t.text :file_name, null: false
      t.integer :file_size, null: false, default: 0
      t.text :file_digest, null: false
      t.integer :uploaded_by_educator_id, null: false
      t.boolean :completed, null: false, default: false
      t.json :stats, null: false

      t.timestamps
    end
    add_foreign_key :student_voice_survey_uploads, :educators,
      column: :uploaded_by_educator_id,
      name: 'student_voice_survey_uploads_for_uploaded_by_educator_id_fk'

    create_table :student_voice_completed_surveys do |t|
      t.integer :student_voice_survey_upload_id, null: false
      t.integer :student_id, null: false

      t.datetime :form_timestamp, null: false
      t.text :first_name, null: false
      t.text :student_lasid, null: false
      t.text :proud, null: false
      t.text :best_qualities, null: false
      t.text :activities_and_interests, null: false
      t.text :nervous_or_stressed, null: false
      t.text :learn_best, null: false
      
      t.timestamps
    end

    add_foreign_key :student_voice_completed_surveys, :students,
      name: 'student_voice_completed_surveys_for_student_id_fk'

    add_foreign_key :student_voice_completed_surveys, :student_voice_survey_uploads,
      name: 'student_voice_completed_surveys_for_student_voice_survey_upload'
  end
end
