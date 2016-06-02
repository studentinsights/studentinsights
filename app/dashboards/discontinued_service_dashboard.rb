require "administrate/base_dashboard"

class DiscontinuedServiceDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    service: Field::BelongsTo,
    recorded_by_educator: Field::BelongsTo.with_options(class_name: "Educator"),
    id: Field::Number,
    recorded_by_educator_id: Field::Number,
    recorded_at: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :service,
    :recorded_by_educator,
    :id,
    :recorded_by_educator_id,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :service,
    :recorded_by_educator,
    :id,
    :recorded_by_educator_id,
    :recorded_at,
    :created_at,
    :updated_at,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :service,
    :recorded_by_educator,
    :recorded_by_educator_id,
    :recorded_at,
  ].freeze

  # Overwrite this method to customize how discontinued services are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(discontinued_service)
  #   "DiscontinuedService ##{discontinued_service.id}"
  # end
end
