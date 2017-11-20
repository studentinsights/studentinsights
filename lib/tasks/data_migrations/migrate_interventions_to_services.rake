require './lib/tasks/data_migrations/intervention_migration_helper.rb'

namespace :data_migration do
  desc "Migrate interventions to services"
  task migrate_interventions_to_services: :environment do
    district_name = ENV['DISTRICT_NAME']

    # Only run this migration with Somerville
    raise 'Not the right district!' unless district_name == 'Somerville'

    # Don't run if there are no deprecated Interventions to migrate
    raise 'No interventions!' if Intervention.count == 0

    # Don't run the migration if we don't have a Jill ID lookup configured
    raise 'No Jill ID!' unless ENV['JILL_ID'].present?

    educator_id = Educator.find_by_id!(ENV['JILL_ID']).id

    Intervention.all.each do |intervention|
      InterventionMigrationHelper.new(intervention, educator_id).migrate
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
