# typed: true
class AddGoalToIntervention < ActiveRecord::Migration[4.2]
  def change
    add_column :interventions, :goal, :text
  end
end
