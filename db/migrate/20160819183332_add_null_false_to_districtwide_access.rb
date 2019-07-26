# typed: true
class AddNullFalseToDistrictwideAccess < ActiveRecord::Migration[4.2]
  def change
    change_column :educators, :districtwide_access, :boolean, null: false
  end
end
