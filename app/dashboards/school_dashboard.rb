require "administrate/base_dashboard"

class SchoolDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    students: Field::HasMany,
    educators: Field::HasMany,
    homerooms: Field::HasMany,
    id: Field::Number,
    state_id: Field::Number,
    school_type: Field::String,
    name: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    local_id: Field::String,
    slug: Field::String,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :students,
    :educators,
    :homerooms,
    :id,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :students,
    :educators,
    :homerooms,
    :id,
    :state_id,
    :school_type,
    :name,
    :created_at,
    :updated_at,
    :local_id,
    :slug,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :students,
    :educators,
    :homerooms,
    :state_id,
    :school_type,
    :name,
    :local_id,
    :slug,
  ].freeze

  # Overwrite this method to customize how schools are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(school)
  #   "School ##{school.id}"
  # end
end
