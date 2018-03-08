module FakeDisciplineIncident

  def self.data
    {
      incident_code: DisciplineIncident.valid_incident_codes.sample,
      incident_location: example_locations.sample,
      incident_description: [
        "Lorem ipsum dolor sit amet, elit purus, proin sed ut. Sed duis, id et, pede scelerisque. Neque magnis massa, arcu molestie.",
        "Cras rutrum, elit commodo. In amet, nec sed vel. Mattis condimentum. Natoque sit faucibus, vel dolor, semper mauris.",
        "Lacus posuere non, nec a. Maecenas egestas class. Diam augue, vel nam."
      ].sample
    }
  end
  def self.example_locations
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
end
