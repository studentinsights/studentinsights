class RenameBehaviorIncidentsToDisciplineIncidents < ActiveRecord::Migration
  def change
    rename_table :behavior_incidents, :discipline_incidents
  end
end
