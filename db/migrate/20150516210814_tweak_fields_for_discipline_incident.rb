class TweakFieldsForDisciplineIncident < ActiveRecord::Migration
  def change
    remove_column :discipline_incidents, :incident_time
    remove_column :discipline_incidents, :incident_date
    add_column :discipline_incidents, :incident_date, :datetime
    add_column :discipline_incidents, :has_exact_time, :boolean
  end
end
