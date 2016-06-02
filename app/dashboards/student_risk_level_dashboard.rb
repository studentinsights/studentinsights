require "administrate/base_dashboard"

class StudentRiskLevelDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student: Field::BelongsTo,
    id: Field::Number,
    level: Field::Number,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    mcas_math_risk_level: Field::Number,
    star_math_risk_level: Field::Number,
    mcas_ela_risk_level: Field::Number,
    star_reading_risk_level: Field::Number,
    limited_english_proficiency_risk_level: Field::Number,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student,
    :id,
    :level,
    :created_at,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student,
    :id,
    :level,
    :created_at,
    :updated_at,
    :mcas_math_risk_level,
    :star_math_risk_level,
    :mcas_ela_risk_level,
    :star_reading_risk_level,
    :limited_english_proficiency_risk_level,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student,
    :level,
    :mcas_math_risk_level,
    :star_math_risk_level,
    :mcas_ela_risk_level,
    :star_reading_risk_level,
    :limited_english_proficiency_risk_level,
  ].freeze

  # Overwrite this method to customize how student risk levels are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(student_risk_level)
  #   "StudentRiskLevel ##{student_risk_level.id}"
  # end
end
