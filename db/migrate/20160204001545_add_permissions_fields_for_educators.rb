class AddPermissionsFieldsForEducators < ActiveRecord::Migration
  def change
    add_column :educators, :schoolwide_access, :boolean, default: false
    add_column :educators, :grade_level_access, :string, array: true
    add_index  :educators, :grade_level_access, using: 'gin'
  end
end
