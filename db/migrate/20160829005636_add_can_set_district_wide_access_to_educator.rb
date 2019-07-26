# typed: true
class AddCanSetDistrictWideAccessToEducator < ActiveRecord::Migration[4.2]
  def change
    add_column :educators, :can_set_districtwide_access, :boolean, default: false, null: false
  end
end
