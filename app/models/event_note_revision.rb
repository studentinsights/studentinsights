class EventNoteRevision < ActiveRecord::Base
  belongs_to :event_note
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type

  validates :educator, :student, :event_note_type, :event_note, presence: true
end
