FactoryBot.define do
  factory :event_note_revision do
    association :event_note
    association :educator
    association :student
    event_note_type { EventNoteType.all.sample }
    text "MyText"
    created_at "2016-04-11 01:41:48"
    updated_at "2016-04-11 01:41:48"
    version 1
  end
end
