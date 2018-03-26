def example_incident_codes
  [
    "?",
    "AS",
    "AWOL",
    "Alcohol-Possession",
    "Assault",
    "Attendance-Other",
    "Bullying",
    "CBMD",
    "CC",
    "CP",
    "CSD",
    "CTD",
    "Cell Phone",
    "Cheating",
    "CutExcess",
    "DI",
    "DSR",
    "Defiant",
    "Disorderly Conduct",
    "Displays Affection",
    "Disruptive",
    "Drugs-Marij possess",
    "Drugs-Marijuana use",
    "Drugs-Paraphernalia",
    "Drugs-Possession",
    "Drugs-Sale Of",
    "Drugs-Suspicion",
    "Drugs-Use",
    "ET",
    "FO",
    "Felony Conviction",
    "Forging abs excuse",
    "Gesture",
    "Harass-Nonsexual",
    "Harass-Other",
    "ID",
    "IRMK",
    "Insubordination",
    "LeftClass",
    "MarijuanaUse",
    "Medication-Other",
    "NI",
    "OBI",
    "OBO",
    "OT",
    "Obscene behavior",
    "Obscene elec msg",
    "Obscene gestures",
    "Obscene language",
    "Obscene written msg",
    "Other Offenses",
    "Physical Altercation",
    "Profanity",
    "RCOP",
    "RD",
    "RHOUSE",
    "RIDH",
    "SW",
    "Sexual Offenses",
    "Skipping class",
    "Suicide-Other",
    "Suspendable",
    "TR",
    "Tardiness",
    "Threat-School, Other",
    "Tobacco-Other",
    "Tobacco-Use",
    "Truancy",
    "VCP",
    "VIOL-Arson",
    "VIOL-Assault Alterc",
    "VIOL-Assault Battery",
    "VIOL-Fighting",
    "VIOL-Harass Sexual",
    "VIOL-Other Incident",
    "VIOL-Robbery Threat",
    "VIOL-Sexual Battery",
    "VIOL-Theft",
    "VIOL-Threat Electron",
    "VIOL-Threat Intimid",
    "VIOL-Threat Other",
    "VIOL-Threat Physical",
    "VIOL-Threat Terror",
    "VIOL-Threat Verbal",
    "VIOL-Threat Written",
    "VIOL-Vandalism",
    "VIOL-Vandalism Other",
    "VIOL-Vandalism Prsnl",
    "VIOL-Vandalism Skl",
    "Violation of Rules",
    "WEAPON-Explosive",
    "WEAPON-Gun",
    "WEAPON-Knife",
    "WEAPON-Other",
    "WEAPON-OtherFireArm",
    "Wander",
    "Weapons Possession",
    "XT"
  ]
end

def example_incident_locations
  [
    "Admin area",
    "Auditorium",
    "Bus stop",
    "Cafeteria",
    "Classroom",
    "Computer lab",
    "Hallway",
    "Library/media center",
    "Locker room/gym",
    "MainOffice",
    "Off campus",
    "Off-campus District",
    "Off-campus School",
    "On campus",
    "On-campus inside",
    "On-campus outside",
    "Online",
    "Outside",
    "Parking",
    "Playground",
    "Restroom",
    "School bus",
    "Stadium",
    "Unknown",
    "Walking School"
  ]
end

def example_incident_descriptions
  [
    "Earlier today something happened with the student that was concerning and we did this to de-escalate and support them in the moment, and then took these steps to understand the underlying challenges they're facing, and adapt how we're working with them moving forward."
  ]
end

FactoryGirl.define do
  factory :discipline_incident do
    association :student
    sequence(:incident_code) { example_incident_codes.sample }
    sequence(:incident_location) { example_incident_locations.sample }
    sequence(:incident_description) { example_incident_descriptions.sample }
    has_exact_time { if Random::rand(1.0) > 0.91 then true else false end }
    occurred_at do
      time = DemoDataUtil.random_time
      if has_exact_time then time else time.beginning_of_day end
    end
  end
end
