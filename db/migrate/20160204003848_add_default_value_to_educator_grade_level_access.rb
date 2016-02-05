class AddDefaultValueToEducatorGradeLevelAccess < ActiveRecord::Migration
  def change
    change_column :educators, :grade_level_access, :string, array: true, default: []
  end
end
