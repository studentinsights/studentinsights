class AddSchoolYearIdToDisciplineIncident < ActiveRecord::Migration
  def change
    add_column :discipline_incidents, :school_year_id, :integer
  end
end
