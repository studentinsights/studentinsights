class ChangeDisciplineIncidentEventDateName < ActiveRecord::Migration
  def change
    rename_column :discipline_incidents, :incident_date, :event_date
  end
end
