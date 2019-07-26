# typed: true
class AddNumberOfHoursToIntervention < ActiveRecord::Migration[4.2]
  def change
    add_column :interventions, :number_of_hours, :integer
  end
end
