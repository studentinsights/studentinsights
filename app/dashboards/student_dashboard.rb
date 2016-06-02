require "administrate/base_dashboard"

class StudentDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    homeroom: Field::BelongsTo,
    school: Field::BelongsTo,
    student_school_years: Field::HasMany,
    student_assessments: Field::HasMany,
    assessments: Field::HasMany,
    interventions: Field::HasMany,
    event_notes: Field::HasMany,
    services: Field::HasMany,
    student_risk_level: Field::HasOne,
    id: Field::Number,
    grade: Field::String,
    hispanic_latino: Field::Boolean,
    race: Field::String,
    free_reduced_lunch: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    first_name: Field::String,
    last_name: Field::String,
    state_id: Field::String,
    home_language: Field::String,
    student_address: Field::String,
    registration_date: Field::DateTime,
    local_id: Field::String,
    program_assigned: Field::String,
    sped_placement: Field::String,
    disability: Field::String,
    sped_level_of_need: Field::String,
    plan_504: Field::String,
    limited_english_proficiency: Field::String,
    most_recent_mcas_math_growth: Field::Number,
    most_recent_mcas_ela_growth: Field::Number,
    most_recent_mcas_math_performance: Field::String,
    most_recent_mcas_ela_performance: Field::String,
    most_recent_mcas_math_scaled: Field::Number,
    most_recent_mcas_ela_scaled: Field::Number,
    most_recent_star_reading_percentile: Field::Number,
    most_recent_star_math_percentile: Field::Number,
    enrollment_status: Field::String,
    date_of_birth: Field::DateTime,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :homeroom,
    :school,
    :student_school_years,
    :student_assessments,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :homeroom,
    :school,
    :student_school_years,
    :student_assessments,
    :assessments,
    :interventions,
    :event_notes,
    :services,
    :student_risk_level,
    :id,
    :grade,
    :hispanic_latino,
    :race,
    :free_reduced_lunch,
    :created_at,
    :updated_at,
    :first_name,
    :last_name,
    :state_id,
    :home_language,
    :student_address,
    :registration_date,
    :local_id,
    :program_assigned,
    :sped_placement,
    :disability,
    :sped_level_of_need,
    :plan_504,
    :limited_english_proficiency,
    :most_recent_mcas_math_growth,
    :most_recent_mcas_ela_growth,
    :most_recent_mcas_math_performance,
    :most_recent_mcas_ela_performance,
    :most_recent_mcas_math_scaled,
    :most_recent_mcas_ela_scaled,
    :most_recent_star_reading_percentile,
    :most_recent_star_math_percentile,
    :enrollment_status,
    :date_of_birth,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :homeroom,
    :school,
    :student_school_years,
    :student_assessments,
    :assessments,
    :interventions,
    :event_notes,
    :services,
    :student_risk_level,
    :grade,
    :hispanic_latino,
    :race,
    :free_reduced_lunch,
    :first_name,
    :last_name,
    :state_id,
    :home_language,
    :student_address,
    :registration_date,
    :local_id,
    :program_assigned,
    :sped_placement,
    :disability,
    :sped_level_of_need,
    :plan_504,
    :limited_english_proficiency,
    :most_recent_mcas_math_growth,
    :most_recent_mcas_ela_growth,
    :most_recent_mcas_math_performance,
    :most_recent_mcas_ela_performance,
    :most_recent_mcas_math_scaled,
    :most_recent_mcas_ela_scaled,
    :most_recent_star_reading_percentile,
    :most_recent_star_math_percentile,
    :enrollment_status,
    :date_of_birth,
  ].freeze

  # Overwrite this method to customize how students are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(student)
  #   "Student ##{student.id}"
  # end
end
