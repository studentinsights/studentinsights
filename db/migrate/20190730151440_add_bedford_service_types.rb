class AddBedfordServiceTypes < ActiveRecord::Migration[5.2]
  def change
    puts "AddBedfordServiceTypes starting..."
    puts " ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
    ServiceType.add_bedford_service_types
    puts "AddBedfordServiceTypes done."
    puts " ServiceType.columns.map(&:name): #{ServiceType.columns.map(&:name)}"
  end
end
