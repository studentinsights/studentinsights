class IndexesForStudentVoiceSurveys < ActiveRecord::Migration[5.2]
  def change
    add_index :student_voice_completed_surveys, :student_id
    add_index :student_voice_completed_surveys, :form_timestamp
  end
end
