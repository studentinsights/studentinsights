class ServiceSerializer < Struct.new :service

  def serialize_service
    discontinued_service = service.discontinued_services.order(:recorded_at).last
    service.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :provided_by_educator_name,
      :service_type_id,
      :date_started,
      :recorded_by_educator_id,
      :recorded_at
    ]).merge({
      discontinued_by_educator_id: discontinued_service.try(:recorded_by_educator_id),
      discontinued_recorded_at: discontinued_service.try(:recorded_at)
    })
  end

  def self.service_types_index
    index = {}
    ServiceType.all.each do |service_type|
      index[service_type.id] = service_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end

end
