class RemoveEducatorAdmin < ActiveRecord::Migration[5.2]
  def change
    remove_column :educators, :admin
  end
end
