module FakeDisciplineIncident

  def self.data
    {
      incident_code: ["A", "B", "C", "D"].sample,
      incident_location: ["Hallway", "Classroom", "Lunchroom", "Playground"].sample,
      incident_description: ["Bullying", "Fighting", "Sass (not the front-end programming kind)"].sample
    }
  end

end
