class Add2021ServiceTypes < ActiveRecord::Migration[6.0]
  def change
    ServiceType.add_somerville_winter_2021_service_types
  end
end
