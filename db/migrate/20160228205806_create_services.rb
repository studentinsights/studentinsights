class CreateServices < ActiveRecord::Migration
  def change
    create_table :services do |t|
      t.integer :student_id
      t.integer :educator_id
      t.integer :service_type_id
      t.text :text
      t.datetime :recorded_at
      t.datetime :date_started

      t.timestamps
    end
  end
end
