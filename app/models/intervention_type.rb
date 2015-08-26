class InterventionType < ActiveRecord::Base

  def self.seed_somerville_intervention_types
    InterventionType.create([
      { name: "X-Block" },
      { name: "Teaching plan" },
      { name: "Phone call" },
      { name: "Reading tutor" },
      { name: "Math tutor" },
      { name: "After-School Tutoring (ATP)"}
    ])
  end

end
