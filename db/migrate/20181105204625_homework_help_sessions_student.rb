class HomeworkHelpSessionsStudent < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "homework_help_sessions", "students", name: "homework_help_sessions_student_id_fk"
    add_foreign_key "homework_help_sessions", "educators", column: 'recorded_by_educator_id', name: "homework_help_sessions_recorded_by_educator_id_fk"
  end
end
