require "administrate/base_dashboard"

class EventNoteRevisionDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    event_note: Field::BelongsTo,
    id: Field::Number,
    student_id: Field::Number,
    educator_id: Field::Number,
    event_note_type_id: Field::Number,
    text: Field::Text,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    version: Field::Number,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :event_note,
    :id,
    :student_id,
    :educator_id,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :event_note,
    :id,
    :student_id,
    :educator_id,
    :event_note_type_id,
    :text,
    :created_at,
    :updated_at,
    :version,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :event_note,
    :student_id,
    :educator_id,
    :event_note_type_id,
    :text,
    :version,
  ].freeze

  # Overwrite this method to customize how event note revisions are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(event_note_revision)
  #   "EventNoteRevision ##{event_note_revision.id}"
  # end
end
