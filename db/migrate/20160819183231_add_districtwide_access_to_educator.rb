class AddDistrictwideAccessToEducator < ActiveRecord::Migration
  def change
    add_column :educators, :districtwide_access, :boolean, default: false
  end
end
