FactoryGirl.define do
  factory :discipline_incident do
    association :student
    event_date Time.new(2015, 1, 1)
  end
end
