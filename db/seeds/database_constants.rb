class DatabaseConstants
  # Used for initializing the constants in a new database.  This
  # is factored out of the main seed file so it can be used for
  # RSpec tests as well.
  #
  # These are all specific to the initial Somerville deployment, but
  # are used for local development as well and relied on in tests.
  def seed!
    Assessment.seed_somerville_assessments
    InterventionType.seed_somerville_intervention_types
    EventNoteType.seed_somerville_event_note_types
    ServiceType.seed_service_types
    nil
  end
end
