class IsolateSectionsBySchoolYear < ActiveRecord::Migration[5.2]
  def change
    add_column :sections, :district_school_year, :integer, null: true
  end
end
