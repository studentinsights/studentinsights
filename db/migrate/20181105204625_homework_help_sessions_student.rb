class HomeworkHelpSessionsStudent < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "homework_help_sessions", "students", name: "homework_help_sessions_student_id_fk"
  end
end
