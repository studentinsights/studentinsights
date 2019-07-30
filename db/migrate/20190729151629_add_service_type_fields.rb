class AddServiceTypeFields < ActiveRecord::Migration[5.2]
  def change
    add_column :service_types, :description, :string, null: true
    add_column :service_types, :intensity, :string, null: true
    add_column :service_types, :data_owner, :string, null: true
  end
end
