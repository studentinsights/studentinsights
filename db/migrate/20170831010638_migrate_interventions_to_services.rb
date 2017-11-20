class MigrateInterventionsToServices < ActiveRecord::Migration[5.0]
  def change
    district_name = ENV['DISTRICT_NAME']

    # Only run this migration with Somerville
    return unless district_name == 'Somerville'

    # Don't run if there are no deprecated Interventions to migrate
    return if Intervention.count == 0

    # Don't run the migration if we don't have a Jill ID lookup configured
    raise 'No Jill ID!' unless ENV['JILL_ID'].present?

    Intervention.all.each do |intervention|
      InterventionMigrationHelper.new(intervention).migrate
    end

    ActiveRecord::Base.transaction do
      puts "Found #{Intervention.count} deprecated intervention records!"; puts
      puts "Found #{Service.count} service records!"; puts
      puts "Migrating interventions to services..."; puts

      Intervention.all.each do |intervention|
        InterventionMigrationHelper.new(intervention).migrate
        print '.'
      end

      puts "Found #{Intervention.count} deprecated intervention records!"; puts
      puts "Found #{Service.count} service records!"; puts

      puts "Destroying deprecated intervention records ..."

      Intervention.destroy_all
    end
  end
end
