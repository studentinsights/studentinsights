class CreateInterventions < ActiveRecord::Migration
  def change
    create_table :interventions do |t|
      t.integer :student_id
      t.integer :intervention_type_id
      t.text :comment
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps
    end
  end
end
