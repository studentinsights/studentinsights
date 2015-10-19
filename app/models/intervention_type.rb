class InterventionType < ActiveRecord::Base
  has_many :interventions

  def self.seed_somerville_intervention_types
    InterventionType.create([
      { name: "After-School Tutoring (ATP)" },
      { name: "Attendance Officer" },
      { name: "Attendance Contract" },
      { name: "Behavior Contract" },
      { name: "Behavior Plan" },
      { name: "Before School Tutoring" },
      { name: "Boys & Girls Club" },
      { name: "Community Schools" },
      { name: "Counseling: In-House" },
      { name: "Counseling: Outside/Physician Referral" },
      { name: "ER Referral (Mental Health)" },
      { name: "Math Tutor" },
      { name: "Mobile Crisis Referral" },
      { name: "MTSS Referral" },
      { name: "OT/PT Consult" },
      { name: "Parent Communication" },
      { name: "Parent Conference/Meeting" },
      { name: "Peer Mediation" },
      { name: "Reading Tutor" },
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
