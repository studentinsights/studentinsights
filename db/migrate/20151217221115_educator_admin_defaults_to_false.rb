class EducatorAdminDefaultsToFalse < ActiveRecord::Migration
  def change
    change_column :educators, :admin, :boolean, default: false
  end
end
