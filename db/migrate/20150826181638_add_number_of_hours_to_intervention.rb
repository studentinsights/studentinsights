class AddNumberOfHoursToIntervention < ActiveRecord::Migration
  def change
    add_column :interventions, :number_of_hours, :integer
  end
end
