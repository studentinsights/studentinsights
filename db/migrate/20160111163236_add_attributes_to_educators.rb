class AddAttributesToEducators < ActiveRecord::Migration
  def change
    add_column :educators, :full_name, :string
    add_column :educators, :state_id, :string
    add_column :educators, :local_id, :string
    add_column :educators, :staff_type, :string
  end
end
