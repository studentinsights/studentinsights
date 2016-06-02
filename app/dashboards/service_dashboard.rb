require "administrate/base_dashboard"

class ServiceDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student: Field::BelongsTo,
    recorded_by_educator: Field::BelongsTo.with_options(class_name: "Educator"),
    service_type: Field::BelongsTo,
    discontinued_services: Field::HasMany,
    id: Field::Number,
    recorded_by_educator_id: Field::Number,
    recorded_at: Field::DateTime,
    date_started: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    provided_by_educator_name: Field::String,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student,
    :recorded_by_educator,
    :service_type,
    :discontinued_services,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student,
    :recorded_by_educator,
    :service_type,
    :discontinued_services,
    :id,
    :recorded_by_educator_id,
    :recorded_at,
    :date_started,
    :created_at,
    :updated_at,
    :provided_by_educator_name,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student,
    :recorded_by_educator,
    :service_type,
    :discontinued_services,
    :recorded_by_educator_id,
    :recorded_at,
    :date_started,
    :provided_by_educator_name,
  ].freeze

  # Overwrite this method to customize how services are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(service)
  #   "Service ##{service.id}"
  # end
end
