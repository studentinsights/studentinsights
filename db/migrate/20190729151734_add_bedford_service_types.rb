class AddBedfordServiceTypes < ActiveRecord::Migration[5.2]
  def change
    ServiceType.add_bedford_service_types
  end
end
