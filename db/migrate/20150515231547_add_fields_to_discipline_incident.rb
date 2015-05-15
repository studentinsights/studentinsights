class AddFieldsToDisciplineIncident < ActiveRecord::Migration
  def change
    add_column :discipline_incidents, :incident_time, :time
    add_column :discipline_incidents, :incident_location, :string
    add_column :discipline_incidents, :incident_description, :string
  end
end
