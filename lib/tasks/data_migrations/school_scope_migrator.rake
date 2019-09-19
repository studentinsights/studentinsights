namespace :data_migration do
  desc "For migrating records when school scope is reduced"
  task school_scope_migrator_migrate_all: :environment do
    SchoolScopeMigrator.new.migrate_all!
  end
end
