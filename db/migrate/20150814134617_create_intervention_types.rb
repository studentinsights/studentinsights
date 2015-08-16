class CreateInterventionTypes < ActiveRecord::Migration
  def change
    create_table :intervention_types do |t|
      t.string :name

      t.timestamps
    end
  end
end
