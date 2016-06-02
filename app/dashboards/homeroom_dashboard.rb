require "administrate/base_dashboard"

class HomeroomDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    students: Field::HasMany,
    student_risk_levels: Field::HasMany,
    educator: Field::BelongsTo,
    school: Field::BelongsTo,
    id: Field::Number,
    name: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    students_count: Field::Number,
    slug: Field::String,
    grade: Field::String,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :students,
    :student_risk_levels,
    :educator,
    :school,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :students,
    :student_risk_levels,
    :educator,
    :school,
    :id,
    :name,
    :created_at,
    :updated_at,
    :students_count,
    :slug,
    :grade,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :students,
    :student_risk_levels,
    :educator,
    :school,
    :name,
    :students_count,
    :slug,
    :grade,
  ].freeze

  # Overwrite this method to customize how homerooms are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(homeroom)
  #   "Homeroom ##{homeroom.id}"
  # end
end
