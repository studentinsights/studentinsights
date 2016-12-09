class EventNoteAttachment < ActiveRecord::Base
  belongs_to :event_note
  validates :url, presence: true
end
