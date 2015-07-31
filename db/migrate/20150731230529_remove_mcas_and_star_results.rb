class RemoveMcasAndStarResults < ActiveRecord::Migration
  def change
    drop_table :mcas_results
    drop_table :star_results
  end
end
