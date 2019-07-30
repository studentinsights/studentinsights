class AddServiceTypeFields < ActiveRecord::Migration[5.2]
  def change
    puts ">> AddServiceTypeFields | adding columns..."
    ServiceType.reset_column_information
    puts "  ServiceType.all.size: #{ServiceType.all.size}"
    puts "  ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
    add_column :service_types, :description, :string, null: true
    add_column :service_types, :intensity, :string, null: true
    add_column :service_types, :data_owner, :string, null: true
    puts ">> AddServiceTypeFields | done."
    ServiceType.reset_column_information
    puts "  ServiceType.all.size: #{ServiceType.all.size}"
    puts "  ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
  end
end
