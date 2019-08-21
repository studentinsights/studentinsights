class AddServiceTypeFields < ActiveRecord::Migration[5.2]
  def change
    add_column :service_types, :description, :string, null: true
    add_column :service_types, :intensity, :string, null: true
    add_column :service_types, :data_owner, :string, null: true
    ServiceType.reset_column_information # see https://github.com/studentinsights/studentinsights/pull/2537#issuecomment-516581271
  end
end
