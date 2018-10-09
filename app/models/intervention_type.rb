# Deprecated
class InterventionType < ApplicationRecord
  has_many :interventions

  # If this becomes out of sync with production, you can
  # generate this with:
  # `puts InterventionType.all.as_json.map {|i| i.except('created_at', 'updated_at') }`
  def self.seed_for_all_districts
    InterventionType.destroy_all
    InterventionType.create([
      { id: 20, name: "After-School Tutoring (ATP)" },
      { id: 21, name: "Attendance Officer" },
      { id: 22, name: "Attendance Contract" },
      { id: 23, name: "Behavior Contract" },
      { id: 24, name: "Behavior Plan" },
      { id: 25, name: "Boys & Girls Club" },
      { id: 26, name: "Classroom Academic Intervention" },
      { id: 27, name: "Classroom Behavior Intervention" },
      { id: 28, name: "Community Schools" },
      { id: 29, name: "Counseling: In-House" },
      { id: 30, name: "Counseling: Outside/Physician Referral" },
      { id: 31, name: "ER Referral (Mental Health)" },
      { id: 32, name: "Math Tutor" },
      { id: 33, name: "Mobile Crisis Referral" },
      { id: 34, name: "MTSS Referral" },
      { id: 35, name: "OT/PT Consult" },
      { id: 36, name: "Parent Communication" },
      { id: 37, name: "Parent Conference/Meeting" },
      { id: 39, name: "Peer Mediation" },
      { id: 40, name: "Reading Specialist" },
      { id: 41, name: "Reading Tutor" },
      { id: 42, name: "SST Referral" },
      { id: 43, name: "Weekly Call/Email Home" },
      { id: 44, name: "X Block Tutor" },
      { id: 45, name: "51a Filing" },
      { id: 46, name: "Other "}
    ])
  end

end
