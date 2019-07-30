class AddServiceTypeFields < ActiveRecord::Migration[5.2]
  def change
    puts ">> AddServiceTypeFields | adding columns..."
    puts " ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
    add_column :service_types, :description, :string, null: true
    add_column :service_types, :intensity, :string, null: true
    add_column :service_types, :data_owner, :string, null: true
    puts ">> AddServiceTypeFields | done."
    puts " ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
  end
end
