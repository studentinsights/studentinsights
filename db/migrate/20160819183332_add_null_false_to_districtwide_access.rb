class AddNullFalseToDistrictwideAccess < ActiveRecord::Migration
  def change
    change_column :educators, :districtwide_access, :boolean, null: false
  end
end
