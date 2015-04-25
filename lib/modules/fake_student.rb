module FakeStudent

  # Fake data for demo roster

  FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
  LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

  def self.data
    {
      grade: "5",
      hispanic_latino: [true, false].sample,
      race: ["A", "B", "H", "W"].sample, 
      low_income: [true, false].sample,
      first_name: FIRST_NAMES.sample,
      last_name: LAST_NAMES.sample,
      state_identifier: "000#{rand(1000)}", 
      limited_english_proficient: [true, false].sample, 
      former_limited_english_proficient: [true, false].sample,
      sped: [true, false, false, false].sample
    }
  end

end