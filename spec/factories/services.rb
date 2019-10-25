FactoryBot.define do
  factory :service do
    association :student
    service_type { ServiceType.all.sample }
    date_started { Date.new(2014, 9, 9) }
    recorded_at { Date.new(2014, 11, 2) }
    discontinued_at { Date.new(2014, 12, 2) }
    association :recorded_by_educator, factory: :educator
  end
end
