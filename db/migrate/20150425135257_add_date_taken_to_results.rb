class AddDateTakenToResults < ActiveRecord::Migration
  def change
    add_column :star_results, :date_taken, :date
    add_column :mcas_results, :date_taken, :date
  end
end
