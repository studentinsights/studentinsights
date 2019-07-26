# typed: true
class AddDistrictwideAccessToEducator < ActiveRecord::Migration[4.2]
  def change
    add_column :educators, :districtwide_access, :boolean, default: false
  end
end
