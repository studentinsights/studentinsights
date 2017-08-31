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
      InterventionMigrationHelper.new(intervention).migrate
    end

    Intervention.destroy_all
  end
end
