class AddLocalIdToSchools < ActiveRecord::Migration
  def change
    add_column :schools, :local_id, :string
  end
end
