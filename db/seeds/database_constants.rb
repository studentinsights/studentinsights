class DatabaseConstants
  # Used for initializing the constants in a new database in development
  # or test.  This is factored out of the main seed file so it can be used
  # for RSpec tests as well.  These could be used as pieces of a new
  # production deployment as well.
  def seed_for_all_districts!
    Assessment.seed_for_all_districts
    InterventionType.seed_for_all_districts
    EventNoteType.seed_for_all_districts

    # These work like manual migrations in production, so this
    # sort of recreates the same process in dev/test.
    ServiceType.reset_column_information
    ServiceType.seed_for_all_districts
    ServiceType.add_summer_program_status_to_service_types
    ServiceType.add_somerville_summer_2018_service_types
    ServiceType.add_bedford_service_types
    ServiceType.add_somerville_heggerty_service_types
    ServiceType.update_somerville_descriptions
    ServiceType.add_somerville_winter_2021_service_types
  end
end
