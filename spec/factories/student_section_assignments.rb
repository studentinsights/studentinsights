FactoryGirl.define do
  factory :student_section_assignment do
    association :student
    association :section
  end
end
