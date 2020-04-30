class EventNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type
  has_many   :event_note_revisions, dependent: :destroy

  has_many :event_note_attachments, dependent: :destroy
  accepts_nested_attributes_for :event_note_attachments

  validates :educator, :student, :event_note_type, :recorded_at, :text, presence: true
  validates :is_restricted, inclusion: { in: [true, false] }

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

  def latest_revision_at
    event_note_revisions.order(created_at: :desc).limit(1).last.try(:created_at)
  end
end
