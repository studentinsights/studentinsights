FactoryGirl.define do
  factory :discontinued_service do
    association :service
    discontinued_at Date.new(2014, 11, 2)
    association :recorded_by_educator, factory: :educator
  end
end
