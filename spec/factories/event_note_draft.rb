FactoryBot.define do
  factory :event_note_draft do
    sequence :draft_key do 
      |n| "fake-draft-key-#{n}"
    end
    association :educator
    association :student
    event_note_type { EventNoteType.all.sample }
    is_restricted { rand() < 0.2 }
    sequence :text do |n|
      "This is a draft note, ##{n} in the factory."
    end
  end
end
