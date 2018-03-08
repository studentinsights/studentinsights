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
    sequence(:incident_code) { DisciplineIncident.valid_incident_codes.sample }
    sequence(:incident_location) { example_incident_locations.sample }
    sequence(:incident_description) { example_incident_descriptions.sample }
    has_exact_time { if Random::rand(1.0) > 0.91 then true else false end }
    occurred_at do
      time = DemoDataUtil.random_time
      if has_exact_time then time else time.beginning_of_day end
    end
  end
end
