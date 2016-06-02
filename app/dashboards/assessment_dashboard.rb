require "administrate/base_dashboard"

class AssessmentDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student_assessments: Field::HasMany,
    students: Field::HasMany,
    id: Field::Number,
    name: Field::String,
    family: Field::String,
    subject: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student_assessments,
    :students,
    :id,
    :name,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student_assessments,
    :students,
    :id,
    :name,
    :family,
    :subject,
    :created_at,
    :updated_at,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student_assessments,
    :students,
    :name,
    :family,
    :subject,
  ].freeze

  # Overwrite this method to customize how assessments are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(assessment)
  #   "Assessment ##{assessment.id}"
  # end
end
