FactoryBot.define do
  factory :educator_section_assignment do
    association :educator
    association :section
  end
end
