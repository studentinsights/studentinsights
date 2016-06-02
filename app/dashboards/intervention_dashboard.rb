require "administrate/base_dashboard"

class InterventionDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student: Field::BelongsTo,
    educator: Field::BelongsTo,
    intervention_type: Field::BelongsTo,
    school_year: Field::BelongsTo,
    student_school_year: Field::BelongsTo,
    id: Field::Number,
    comment: Field::Text,
    start_date: Field::DateTime,
    end_date: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    number_of_hours: Field::Number,
    goal: Field::Text,
    custom_intervention_name: Field::String,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student,
    :educator,
    :intervention_type,
    :school_year,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student,
    :educator,
    :intervention_type,
    :school_year,
    :student_school_year,
    :id,
    :comment,
    :start_date,
    :end_date,
    :created_at,
    :updated_at,
    :number_of_hours,
    :goal,
    :custom_intervention_name,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student,
    :educator,
    :intervention_type,
    :school_year,
    :student_school_year,
    :comment,
    :start_date,
    :end_date,
    :number_of_hours,
    :goal,
    :custom_intervention_name,
  ].freeze

  # Overwrite this method to customize how interventions are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(intervention)
  #   "Intervention ##{intervention.id}"
  # end
end
