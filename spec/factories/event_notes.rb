FactoryBot.define do

  factory :event_note do
    recorded_at DateTime.new(2016, 4, 9)
    association :educator
    association :student
    sequence :text do |n|
      "This is some factory note text for note ##{n} in the factory."
    end
    event_note_type { EventNoteType.first }
    is_restricted false

    trait :restricted do
      is_restricted true
    end
  end

end
