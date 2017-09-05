module SerializeDataHelper
  def serialize_service(service)
    discontinued_service = service.discontinued_services.order(:discontinued_at).last
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
      discontinued_recorded_at: discontinued_service.try(:discontinued_at)
    })
  end

  # deprecated
  def serialize_intervention(intervention)
    {
      id: intervention.id,
      name: intervention.name,
      intervention_type_id: intervention.intervention_type_id,
      comment: intervention.comment,
      goal: intervention.goal,
      start_date: intervention.start_date.strftime('%B %e, %Y'), # profile v1
      start_date_timestamp: intervention.start_date,
      end_date: intervention.end_date.try(:strftime, '%B %e, %Y'), # profile v1
      educator_email: intervention.educator.try(:email), # profile v1
      educator_id: intervention.educator.try(:id),
    }
  end

  def service_types_index
    index = {}
    ServiceType.all.each do |service_type|
      index[service_type.id] = service_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end

end
