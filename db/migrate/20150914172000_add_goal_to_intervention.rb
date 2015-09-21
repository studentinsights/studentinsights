class AddGoalToIntervention < ActiveRecord::Migration
  def change
    add_column :interventions, :goal, :text
  end
end
