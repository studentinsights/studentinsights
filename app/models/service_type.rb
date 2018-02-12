class ServiceType < ActiveRecord::Base
  has_many :services

  def self.seed_service_types
    ServiceType.destroy_all

    service_types = LoadDistrictConfig.new.service_types

    ServiceType.create!(service_types)
  end
end
