class AddLocalIdToStudent < ActiveRecord::Migration
  def change
    add_column :students, :local_id, :string
  end
end
