class AddEstimatedEndDateToServices < ActiveRecord::Migration[5.1]
  def change
    add_column :services, :estimated_end_date, :datetime
  end
end
