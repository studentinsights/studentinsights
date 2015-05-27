class RemoveEndFromSchoolYear < ActiveRecord::Migration
  def change
    remove_column :school_years, :end
  end
end
