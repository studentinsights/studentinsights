FactoryBot.define do
  sequence(:name) { |n| n.to_s }

  factory :homeroom do
    name { FactoryBot.generate(:name) }
    association :school
  end
end
