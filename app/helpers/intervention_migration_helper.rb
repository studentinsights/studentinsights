class InterventionMigrationHelper < Struct.new :intervention

  INTERVENTION_TYPES_TO_SERVICE_TYPES = {
    20 => 511,
    21 => 502,
    22 => 503,
    23 => 504,
    24 => nil,
    25 => nil,
    26 => nil,
    27 => nil,
    28 => 513,
    29 => 505,
    30 => 506,
    31 => nil,
    32 => 507,
    33 => nil,
    34 => nil,
    35 => nil,
    36 => nil,
    37 => nil,
    39 => nil,
    40 => 507,
    41 => 507,
    42 => nil,
    43 => nil,
    44 => 514,
    45 => nil,
    46 => nil,
  }

  def migrate
    intervention_type_id = intervention.intervention_type_id

    service_type_id = INTERVENTION_TYPES_TO_SERVICE_TYPES[intervention_type_id]

    return if service_type_id.nil?  # This doesn't match our new service type schema so we toss it, TODO -- turn this into an event note so we're not losing any data

    Service.create(
      student: intervention.student,
      recorded_by_educator: jill,
      service_type_id: service_type_id,
      recorded_at: intervention.created_at,
      date_started: intervention.start_date,
      provided_by_educator_name: intervention.educator.full_name,
    )
  end

end
