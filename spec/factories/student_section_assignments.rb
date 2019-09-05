FactoryBot.define do
  factory :student_section_assignment do
    association :student
    association :section
    grade_numeric { rand(40..100.0).round(2) }
  end
end
