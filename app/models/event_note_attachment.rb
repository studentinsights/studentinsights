class EventNoteAttachment < ApplicationRecord
  belongs_to :event_note
  validates :url, presence: true
  validates :event_note, presence: true
end
