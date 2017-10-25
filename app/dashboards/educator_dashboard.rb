require "administrate/base_dashboard"

class EducatorDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    school_id: SchoolNameField.with_options(searchable: false),
    homeroom: HomeroomNameField.with_options(searchable: false),
    students: Field::HasMany.with_options(searchable: false),
    interventions: Field::HasMany.with_options(searchable: false),
    id: Field::Number.with_options(searchable: false),
    email: Field::String.with_options(searchable: false),
    encrypted_password: Field::String.with_options(searchable: false),
    reset_password_token: Field::String.with_options(searchable: false),
    reset_password_sent_at: Field::DateTime.with_options(searchable: false),
    remember_created_at: Field::DateTime.with_options(searchable: false),
    sign_in_count: Field::Number.with_options(searchable: false),
    current_sign_in_at: Field::DateTime.with_options(searchable: false),
    last_sign_in_at: Field::DateTime.with_options(searchable: false),
    current_sign_in_ip: Field::String.with_options(searchable: false),
    last_sign_in_ip: Field::String.with_options(searchable: false),
    created_at: Field::DateTime.with_options(searchable: false),
    updated_at: Field::DateTime.with_options(searchable: false),
    admin: YesNoBooleanField.with_options(searchable: false),
    phone: Field::String.with_options(searchable: false),
    full_name: Field::String,
    state_id: Field::String.with_options(searchable: false),
    local_id: Field::String.with_options(searchable: false),
    staff_type: Field::String.with_options(searchable: false),
    schoolwide_access: YesNoBooleanField.with_options(searchable: false),
    grade_level_access: PostgresArrayField.with_options(searchable: false),
    restricted_to_sped_students: YesNoBooleanField.with_options(searchable: false),
    restricted_to_english_language_learners: YesNoBooleanField.with_options(searchable: false),
    can_view_restricted_notes: YesNoBooleanField.with_options(searchable: false),
    districtwide_access: YesNoBooleanField.with_options(searchable: false),
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :full_name,
    :school_id,
    :homeroom,
    :schoolwide_access,
    :can_view_restricted_notes,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :school_id,
    :homeroom,
    :email,
    :sign_in_count,
    :admin,
    :full_name,
    :schoolwide_access,
    :grade_level_access,
    :restricted_to_sped_students,
    :restricted_to_english_language_learners,
    :can_view_restricted_notes,
    :districtwide_access
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :schoolwide_access,
    :grade_level_access,
    :restricted_to_sped_students,
    :restricted_to_english_language_learners,
    :can_view_restricted_notes,
    :districtwide_access
  ].freeze

  # Overwrite this method to customize how educators are displayed
  # across all pages of the admin dashboard.

  def display_resource(educator)
    "#{educator.full_name}"
  end
end
