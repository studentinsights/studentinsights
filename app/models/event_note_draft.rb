class EventNoteDraft < ApplicationRecord
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type # nullable
  belongs_to :completed_event_note, class_name: 'EventNote' # nullable

  validates :draft_key, presence: true, uniqueness: { scope: [:student_id, :educator_id] }
  validates :educator, :student, presence: true
  validates :is_restricted, inclusion: { in: [true, false] }

  def self.unfinished
    EventNoteDraft.all.joins("""
      LEFT JOIN event_notes
         ON event_note_drafts.draft_key = event_notes.draft_key
        AND event_note_drafts.student_id = event_notes.student_id
        AND event_note_drafts.educator_id = event_notes.educator_id
    """).where('event_notes.id = NULL')
  end

  def is_unfinished?
    EventNote.where({
      draft_key: self.draft_key,
      student_id: self.student_id,
      educator_id: self.educator_id
    }).limit(1).size > 0
  end

  def composite_key
    [self.educator_id, self.student_id, self.draft_key].join(':')
  end

  # override, ensure that restricted text isn't accidentally serialized
  def as_json(options = {})
    json = super(options)
    RestrictedTextRedacter.new.redacted_as_json({
      super_json: json,
      restricted_key: 'text',
      is_restricted: self.is_restricted,
      as_json_options: options
    })
  end
end
