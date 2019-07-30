class AddBedfordServiceTypes < ActiveRecord::Migration[5.2]
  def change
    puts "AddBedfordServiceTypes starting..."
    puts " ServiceType.column_names: #{ServiceType.column_names}"
    ServiceType.add_bedford_service_types
    puts "AddBedfordServiceTypes done."
    puts " ServiceType.column_names: #{ServiceType.column_names}"
  end
end
