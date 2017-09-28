FactoryGirl.define do
  factory :student_section_assignment do
    association :student
    association :section
    grade_numeric { rand(500..1000) / 10 }
  end
end
