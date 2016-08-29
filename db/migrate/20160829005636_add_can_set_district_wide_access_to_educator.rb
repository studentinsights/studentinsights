class AddCanSetDistrictWideAccessToEducator < ActiveRecord::Migration
  def change
    add_column :educators, :can_set_districtwide_access, :boolean, default: false, null: false
  end
end
