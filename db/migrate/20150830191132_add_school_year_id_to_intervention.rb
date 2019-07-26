# typed: true
class AddSchoolYearIdToIntervention < ActiveRecord::Migration[4.2]
  def change
    add_column :interventions, :school_year_id, :integer
  end
end
