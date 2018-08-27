FactoryBot.define do

  factory :transition_note do
    recorded_at DateTime.new(2016, 4, 9)
    association :educator
    association :student
    sequence :text do |n|
      "This is some factory note text for transition note ##{n} in the factory."
    end
    is_restricted false
  end
end
