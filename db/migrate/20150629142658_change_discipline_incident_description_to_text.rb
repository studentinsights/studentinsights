class ChangeDisciplineIncidentDescriptionToText < ActiveRecord::Migration
  def change
    change_column :discipline_incidents, :incident_description, :text
  end
end
