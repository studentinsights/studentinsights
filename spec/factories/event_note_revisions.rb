FactoryBot.define do
  factory :event_note_revision do
    association :event_note
    association :educator
    student_id 1
    event_note_type_id 1
    text "MyText"
    created_at "2016-04-11 01:41:48"
    updated_at "2016-04-11 01:41:48"
    version 1
  end
end
