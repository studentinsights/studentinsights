class DatabaseConstants
  # Used for initializing the constants in a new database.  This
  # is factored out of the main seed file so it can be used for
  # RSpec tests as well.
  #
  # These are all specific to the initial Somerville deployment, but
  # are used for local development as well and relied on in tests.
  def seed_for_all_districts!
    Assessment.seed_for_all_districts
    InterventionType.seed_for_all_districts
    EventNoteType.seed_for_all_districts
    ServiceType.seed_for_all_districts
    ServiceType.add_summer_program_status_to_service_types
    ServiceType.add_somerville_summer_2018_service_types
    nil
  end
end
