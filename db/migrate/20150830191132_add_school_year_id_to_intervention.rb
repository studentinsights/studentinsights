class AddSchoolYearIdToIntervention < ActiveRecord::Migration
  def change
    add_column :interventions, :school_year_id, :integer
  end
end
