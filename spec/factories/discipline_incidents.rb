FactoryGirl.define do
  factory :discipline_incident do
    association :student
    occurred_at { Time.now }
  end
end
