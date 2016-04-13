module FakeDisciplineIncident

  def self.data
    {
      incident_code: ["A", "B", "C", "D"].sample,
      incident_location: ["Hallway", "Classroom", "Lunchroom", "Playground"].sample,
      incident_description: [
        "Lorem ipsum dolor sit amet, elit purus, proin sed ut. Sed duis, id et, pede scelerisque. Neque magnis massa, arcu molestie.",
        "Cras rutrum, elit commodo. In amet, nec sed vel. Mattis condimentum. Natoque sit faucibus, vel dolor, semper mauris.",
        "Lacus posuere non, nec a. Maecenas egestas class. Diam augue, vel nam."
      ].sample
    }
  end

end
