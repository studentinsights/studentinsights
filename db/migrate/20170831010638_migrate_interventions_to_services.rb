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

    Intervention.all.each do |intervention|
      intervention_type_id = intervention.intervention_type_id

      lookup_hash = InterventionMigrationHelper::INTERVENTION_TYPES_TO_SERVICE_TYPES

      service_type_id = lookup_hash[intervention_type_id]

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
