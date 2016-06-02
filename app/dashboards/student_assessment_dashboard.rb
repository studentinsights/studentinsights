require "administrate/base_dashboard"

class StudentAssessmentDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    assessment: Field::BelongsTo,
    student: Field::BelongsTo,
    school_year: Field::BelongsTo,
    student_school_year: Field::BelongsTo,
    id: Field::Number,
    scale_score: Field::Number,
    growth_percentile: Field::Number,
    performance_level: Field::String,
    date_taken: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    percentile_rank: Field::Number,
    instructional_reading_level: Field::String.with_options(searchable: false),
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :assessment,
    :student,
    :school_year,
    :student_school_year,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :assessment,
    :student,
    :school_year,
    :student_school_year,
    :id,
    :scale_score,
    :growth_percentile,
    :performance_level,
    :date_taken,
    :created_at,
    :updated_at,
    :percentile_rank,
    :instructional_reading_level,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :assessment,
    :student,
    :school_year,
    :student_school_year,
    :scale_score,
    :growth_percentile,
    :performance_level,
    :date_taken,
    :percentile_rank,
    :instructional_reading_level,
  ].freeze

  # Overwrite this method to customize how student assessments are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(student_assessment)
  #   "StudentAssessment ##{student_assessment.id}"
  # end
end
