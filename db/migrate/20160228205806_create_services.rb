# typed: true
class CreateServices < ActiveRecord::Migration[4.2]
  def change
    create_table :services do |t|
      t.integer :student_id
      t.integer :provided_by_educator_id
      t.integer :recorded_by_educator_id
      t.integer :service_type_id
      t.datetime :recorded_at
      t.datetime :date_started

      t.timestamps
    end
  end
end
