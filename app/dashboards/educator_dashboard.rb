require "administrate/base_dashboard"

class EducatorDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    school: Field::BelongsTo,
    homeroom: Field::HasOne,
    students: Field::HasMany,
    interventions: Field::HasMany,
    id: Field::Number,
    email: Field::String,
    encrypted_password: Field::String,
    reset_password_token: Field::String,
    reset_password_sent_at: Field::DateTime,
    remember_created_at: Field::DateTime,
    sign_in_count: Field::Number,
    current_sign_in_at: Field::DateTime,
    last_sign_in_at: Field::DateTime,
    current_sign_in_ip: Field::String.with_options(searchable: false),
    last_sign_in_ip: Field::String.with_options(searchable: false),
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    admin: Field::Boolean,
    phone: Field::String,
    full_name: Field::String,
    state_id: Field::String,
    local_id: Field::String,
    staff_type: Field::String,
    schoolwide_access: Field::Boolean,
    grade_level_access: Field::String,
    restricted_to_sped_students: Field::Boolean,
    restricted_to_english_language_learners: Field::Boolean,
    can_view_restricted_notes: Field::Boolean,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :full_name,
    :homeroom,
    :schoolwide_access,
    :can_view_restricted_notes,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :school,
    :homeroom,
    :students,
    :interventions,
    :email,
    :sign_in_count,
    :last_sign_in_at,
    :admin,
    :phone,
    :full_name,
    :state_id,
    :local_id,
    :staff_type,
    :schoolwide_access,
    :grade_level_access,
    :restricted_to_sped_students,
    :restricted_to_english_language_learners,
    :can_view_restricted_notes,
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
  ].freeze

  # Overwrite this method to customize how educators are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(educator)
  #   "Educator ##{educator.id}"
  # end
end
