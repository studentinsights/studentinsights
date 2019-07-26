# typed: true
class AddDefaultValueToEducatorGradeLevelAccess < ActiveRecord::Migration[4.2]
  def change
    change_column :educators, :grade_level_access, :string, array: true, default: []
  end
end
