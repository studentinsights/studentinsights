class InterventionType < ActiveRecord::Base
  has_many :interventions

  def self.seed_somerville_intervention_types
    InterventionType.create([
      { name: "After-School Tutoring (ATP)" },
      { name: "Attendance Officer" },
      { name: "In-House Counseling" },
      { name: "Attendance Contract" },
      { name: "Behavior Contract" },
      { name: "Behavior Plan" },
      { name: "Before School Tutoring" },
      { name: "Boys & Girls Club" },
      { name: "Community Schools" },
      { name: "Math Teacher" },
      { name: "Outside Counseling/Physician Referral" },
      { name: "Peer Mediation" },
      { name: "Phone Call" },
      { name: "Reading Teacher" },
      { name: "Weekly Call/Email Home" },
      { name: "Teaching Plan" },
      { name: "X Block Tutor" },
      { name: "51a Filing" },
      { name: "Other" }
    ])
  end

  def self.atp
    find_by_name("After-School Tutoring (ATP)")
  end

end
