module FakeDisciplineIncident

  def self.data
    {
      incident_code: ["A", "B", "C", "D"].sample,
      incident_location: ["Hallway", "Classroom", "Lunchroom", "Playground"].sample,
      incident_description: ["Bullying", "Fighting", "Sass (not the front-end programming kind)"].sample,
      incident_date: Time.at(Time.local(2010, 1, 1) + rand * (Time.now.to_f - Time.local(2010, 1, 1).to_f))
    }
  end

end
