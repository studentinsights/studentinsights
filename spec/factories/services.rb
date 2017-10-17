FactoryGirl.define do
  factory :service do
    association :student
    association :service_type
    date_started Date.new(2014, 9, 9)
    recorded_at Date.new(2014, 11, 2)
    discontinued_at Date.today + 180.days
    association :recorded_by_educator, factory: :educator
  end
end
