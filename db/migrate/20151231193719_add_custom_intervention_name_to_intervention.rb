class AddCustomInterventionNameToIntervention < ActiveRecord::Migration
  def change
    add_column :interventions, :custom_intervention_name, :string
  end
end
