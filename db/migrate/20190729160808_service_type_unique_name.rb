class ServiceTypeUniqueName < ActiveRecord::Migration[5.2]
  def change
    # avoid potential confusion
    change_column :service_types, :name, :string, default: false, unique: true
  end
end
