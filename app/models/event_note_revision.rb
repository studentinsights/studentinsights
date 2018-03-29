class EventNoteRevision < ActiveRecord::Base
  belongs_to :event_note
  belongs_to :educator
end
