class AddKeysForCounselorMeetings < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "counselor_meetings", "educators", name: "counselor_meetings_educator_id_fk"
    add_foreign_key "counselor_meetings", "students", name: "counselor_meetings_student_id_fk"
    add_foreign_key "educator_searchbars", "educators", name: "educator_searchbars_educator_id_fk"
  end
end
