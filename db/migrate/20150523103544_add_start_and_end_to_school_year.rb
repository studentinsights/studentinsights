class AddStartAndEndToSchoolYear < ActiveRecord::Migration
  def change
    add_column :school_years, :start, :date
    add_column :school_years, :end, :date
  end
end
