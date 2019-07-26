# typed: true
class AddCustomInterventionNameToIntervention < ActiveRecord::Migration[4.2]
  def change
    add_column :interventions, :custom_intervention_name, :string
  end
end
