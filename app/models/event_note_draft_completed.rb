# class EventNoteDraft < ApplicationRecord
#   belongs_to :educator
#   belongs_to :student
#   belongs_to :event_note_type # nullable
#   belongs_to :completed_event_note, class_name: 'EventNote' # nullable

#   validates :draft_key, presence: true, uniqueness: { scope: [:student_id, :educator_id] }
#   validates :educator, :student, presence: true
#   validates :is_restricted, inclusion: { in: [true, false] }

#   # def unfinished
#   #   EventNoteCompleteDraft.where(draft_keY: )
#   # end

#   # override, ensure that restricted text isn't accidentally serialized
#   def as_json(options = {})
#     json = super(options)
#     RestrictedTextRedacter.new.redacted_as_json({
#       super_json: json,
#       restricted_key: 'text',
#       is_restricted: self.is_restricted,
#       as_json_options: options
#     })
#   end
# end
