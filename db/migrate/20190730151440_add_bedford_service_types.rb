class AddBedfordServiceTypes < ActiveRecord::Migration[5.2]
  def change
    puts "AddBedfordServiceTypes starting..."
    ServiceType.reset_column_information
    puts "  ServiceType.all.size: #{ServiceType.all.size}"
    puts "  ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
    ServiceType.add_bedford_service_types
    puts "AddBedfordServiceTypes done."
    ServiceType.reset_column_information
    puts "  ServiceType.all.size: #{ServiceType.all.size}"
    puts "  ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
  end
end
