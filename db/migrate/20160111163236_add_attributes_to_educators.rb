# typed: true
class AddAttributesToEducators < ActiveRecord::Migration[4.2]
  def change
    add_column :educators, :full_name, :string
    add_column :educators, :state_id, :string
    add_column :educators, :local_id, :string
    add_column :educators, :staff_type, :string
  end
end
