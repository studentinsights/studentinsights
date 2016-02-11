FactoryGirl.define do
  factory :event_note, class: 'EventNotes' do
    student_id 1
    educator_id 1
    integer "MyString"
    event_note_type_id 1
    text "MyText"
    recorded_at "2016-02-11 09:23:44"
  end
end
