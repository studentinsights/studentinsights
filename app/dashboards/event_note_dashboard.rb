require "administrate/base_dashboard"

class EventNoteDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    educator: Field::BelongsTo,
    student: Field::BelongsTo,
    event_note_type: Field::BelongsTo,
    id: Field::Number,
    text: Field::Text,
    recorded_at: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    is_restricted: Field::Boolean,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :educator,
    :student,
    :event_note_type,
    :id,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :educator,
    :student,
    :event_note_type,
    :id,
    :text,
    :recorded_at,
    :created_at,
    :updated_at,
    :is_restricted,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :educator,
    :student,
    :event_note_type,
    :text,
    :recorded_at,
    :is_restricted,
  ].freeze

  # Overwrite this method to customize how event notes are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(event_note)
  #   "EventNote ##{event_note.id}"
  # end
end
