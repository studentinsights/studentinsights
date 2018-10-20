class TeamMemberships < ActiveRecord::Migration[5.2]
  def change
      create_table :team_memberships do |t|
        t.integer "student_id", null: false
        t.text "activity_text", null: false
        t.text "coach_text", null: false
        t.text "school_year_text", null: false
        t.datetime "created_at", null: false
        t.datetime "updated_at", null: false
      end
      add_foreign_key :team_memberships, :students
  end
end
