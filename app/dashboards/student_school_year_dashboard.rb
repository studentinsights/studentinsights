require "administrate/base_dashboard"

class StudentSchoolYearDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    student: Field::BelongsTo,
    school_year: Field::BelongsTo,
    absences: Field::HasMany,
    tardies: Field::HasMany,
    student_assessments: Field::HasMany,
    discipline_incidents: Field::HasMany,
    interventions: Field::HasMany,
    id: Field::Number,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :student,
    :school_year,
    :absences,
    :tardies,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :student,
    :school_year,
    :absences,
    :tardies,
    :student_assessments,
    :discipline_incidents,
    :interventions,
    :id,
    :created_at,
    :updated_at,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :student,
    :school_year,
    :absences,
    :tardies,
    :student_assessments,
    :discipline_incidents,
    :interventions,
  ].freeze

  # Overwrite this method to customize how student school years are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(student_school_year)
  #   "StudentSchoolYear ##{student_school_year.id}"
  # end
end
