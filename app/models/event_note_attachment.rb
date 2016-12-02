class EventNoteAttachment < ActiveRecord::Base
  belongs_to :event_note
  validates :url, :event_note, presence: true
end
