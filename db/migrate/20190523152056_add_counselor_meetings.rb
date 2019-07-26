# typed: true
class AddCounselorMeetings < ActiveRecord::Migration[5.2]
  def change
    create_table :counselor_meetings do |t|
      t.integer :student_id, null: false
      t.integer :educator_id, null: false
      t.date :meeting_date, null: false
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
    add_index :counselor_meetings, :student_id, unique: false
    add_index :counselor_meetings, :educator_id, unique: false
    add_index :counselor_meetings, [:student_id, :educator_id, :meeting_date], name: "counselor_meetings_unique_index", unique: true
  end
end
