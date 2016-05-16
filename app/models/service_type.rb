class ServiceType < ActiveRecord::Base
  def self.seed_somerville_service_types
    ServiceType.destroy_all
    ServiceType.create([
      { id: 502, name: 'Attendance Officer'},
      { id: 503, name: 'Attendance Contract'},
      { id: 504, name: 'Behavior Contract'},
      { id: 505, name: 'Counseling, in-house'},
      { id: 506, name: 'Counseling, outside'},
      { id: 507, name: 'Reading intervention'},
      { id: 508, name: 'Math intervention'}     # Deprecated: No adding new Math interventions
                                                # going forward. Focusing on shorter list of
                                                # services with sharp, clear definitions.
    ])
  end
end
