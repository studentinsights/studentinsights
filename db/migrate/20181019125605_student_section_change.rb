class StudentSectionChange < ActiveRecord::Migration[5.2]
  def change
    create_table :student_section_changes do |t|
      t.string :syncer_key
      t.integer :student_id

      # denormalized historical data
      # any keys here are not guaranteed to be valid during future reads
      t.json :student_section_assignment_json
      t.json :section_json
      t.json :course_json
      t.json :student_json
      t.timestamps
    end
  end
end
