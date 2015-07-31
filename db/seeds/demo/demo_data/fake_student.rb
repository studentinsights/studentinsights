module FakeStudent

  def self.data   # Fake data for demo roster
    {
      grade: "5",
      hispanic_latino: [true, false].sample,
      race: ["A", "B", "H", "W"].sample,
      first_name: ["Aladdin", "Chip", "Daisy", "Mickey", "Minnie", "Donald", "Elsa", "Mowgli", "Olaf", "Pluto", "Pocahontas", "Rapunzel", "Snow", "Winnie"].sample,
      last_name: ["Disney", "Duck", "Kenobi", "Mouse", "Pan", "Poppins", "Skywalker", "White"].sample,
      local_id: "000#{rand(1000)}",
      limited_english_proficiency: ["Fluent", "FLEP-Transitioning", "FLEP"].sample,
      free_reduced_lunch: ["Free Lunch", "Not Eligible"].sample
    }
  end

  def self.randomize_504(student)
    probability_of_504 = 98.in(100)   # 2 in 100 have a 504 plan
    if probability_of_504
      student.plan_504 = "Not 504"
    else
      student.plan_504 = "504"
    end
    student.save
  end

  def self.randomize_program_assigned(student)
    probability_of_sped_assignment = 20.in(100)   # 20 in 100 have a SPED placement
    if probability_of_sped_assignment
      student.program_assigned = "Sp Ed"
      student.update_attributes(FakeStudent.sped_data)
    else
      student.program_assigned = ["Reg Ed", "2Way English", "2Way Spanish"].sample
      15.in(100) do   # 15 in 100 Reg Ed students have a disability
        student.update_attributes(FakeStudent.sped_data)
      end
    end
    student.save
  end

  def self.sped_data
    {
      sped_placement: ["Full Inclusion", "Partial Inclusion", "Private Separate"].sample,
      disability: ["Specific LDs", "Emotional", "Communication", "Autism"].sample,
      sped_level_of_need: ["High", "Moderate", "Low >= 2", "Low < 2"].sample,
    }
  end
end
