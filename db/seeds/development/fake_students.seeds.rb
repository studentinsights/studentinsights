Assessment.destroy_all
School.destroy_all
assessment = Assessment.create(name: "MCAS", year: Time.new(2014))
healey = School.create(name: "Arthur D Healey")

Room.destroy_all
n = 0
4.times do |n|
  Room.create(name: "10#{n}")
  n += 1
end

Student.destroy_all
StudentResult.destroy_all

FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

36.times do |s|
  student = Student.create(
              grade: "5",
              hispanic_latino: [true, false].sample,
              race: ["A", "B", "H", "W"].sample, 
              low_income: [true, false].sample,
              room_id: Room.all.sample.id, 
              first_name: FIRST_NAMES.sample,
              last_name: LAST_NAMES.sample,
              state_identifier: "000#{rand(1000)}", 
              limited_english_proficient: [true, false].sample, 
              former_limited_english_proficient: [true, false].sample,
              school_id: healey.id
            )
  result = StudentResult.create(
              student_id: student.id,
              assessment_id: assessment.id,
              ela_scaled: rand(200..280), 
              ela_performance: ["W", "NI", "P", "A"].sample, 
              ela_growth: rand(10..20), 
              math_scaled: rand(200..280), 
              math_performance: ["W", "NI", "P", "A"].sample, 
              math_growth: rand(10..20)
            )
end