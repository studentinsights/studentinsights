# typed: true
class EducatorAdminDefaultsToFalse < ActiveRecord::Migration[4.2]
  def change
    change_column :educators, :admin, :boolean, default: false
  end
end
