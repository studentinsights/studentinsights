require "administrate/base_dashboard"

class SchoolYearDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    attendance_events: Field::HasMany,
    discipline_incidents: Field::HasMany,
    student_assessments: Field::HasMany,
    interventions: Field::HasMany,
    id: Field::Number,
    name: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    start: Field::DateTime,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :attendance_events,
    :discipline_incidents,
    :student_assessments,
    :interventions,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :attendance_events,
    :discipline_incidents,
    :student_assessments,
    :interventions,
    :id,
    :name,
    :created_at,
    :updated_at,
    :start,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :attendance_events,
    :discipline_incidents,
    :student_assessments,
    :interventions,
    :name,
    :start,
  ].freeze

  # Overwrite this method to customize how school years are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(school_year)
  #   "SchoolYear ##{school_year.id}"
  # end
end
