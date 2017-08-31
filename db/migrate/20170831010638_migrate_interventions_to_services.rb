class MigrateInterventionsToServices < ActiveRecord::Migration[5.0]
  def change
    district_name = ENV['DISTRICT_NAME']

    # Only run this migration with Somerville
    return unless district_name = 'Somerville'

    # Don't run the migration if we don't have a Jill ID lookup configured
    return unless ENV['JILL_ID'].present?

    # Don't run if there are no deprecated Interventions to migrate
    return if Intervention.count == 0

    jill = Educator.find_by_id!(ENV['JILL_ID'])

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

    Intervention.all.each do |intervention|
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

    Intervention.destroy_all
  end
end
