class CreateBehaviorIncidents < ActiveRecord::Migration
  def change
    create_table :behavior_incidents do |t|
      t.integer :student_id
      t.date :incident_date
      t.string :incident_code

      t.timestamps
    end
  end
end
