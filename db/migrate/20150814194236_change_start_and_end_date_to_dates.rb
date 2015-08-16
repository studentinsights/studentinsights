class ChangeStartAndEndDateToDates < ActiveRecord::Migration
  def change
    change_column :interventions, :end_date, :date
    change_column :interventions, :start_date, :date
  end
end
