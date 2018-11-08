class HomeworkHelp < ActiveRecord::Migration[5.2]
  def change
    create_table :homework_help_sessions do |t|
      t.integer :student_id
      t.datetime :form_timestamp
      t.json :course_ids
      t.timestamps
    end
  end
end
