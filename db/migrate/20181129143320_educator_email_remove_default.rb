class EducatorEmailRemoveDefault < ActiveRecord::Migration[5.2]
  def change
    change_column :educators, :email, :string, default: nil, null: false
  end
end
