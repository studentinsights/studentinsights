require "administrate/base_dashboard"

class DisciplineIncidentDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student_school_year: Field::BelongsTo,
    id: Field::Number,
    incident_code: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    incident_location: Field::String,
    incident_description: Field::Text,
    occurred_at: Field::DateTime,
    has_exact_time: Field::Boolean,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student_school_year,
    :id,
    :incident_code,
    :created_at,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student_school_year,
    :id,
    :incident_code,
    :created_at,
    :updated_at,
    :incident_location,
    :incident_description,
    :occurred_at,
    :has_exact_time,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student_school_year,
    :incident_code,
    :incident_location,
    :incident_description,
    :occurred_at,
    :has_exact_time,
  ].freeze

  # Overwrite this method to customize how discipline incidents are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(discipline_incident)
  #   "DisciplineIncident ##{discipline_incident.id}"
  # end
end
