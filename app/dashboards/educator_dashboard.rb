require "administrate/base_dashboard"

# See https://administrate-prototype.herokuapp.com/getting_started
class EducatorDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    email: Field::String.with_options(searchable: true),
    full_name: Field::String.with_options(searchable: true),
    local_id: Field::String.with_options(searchable: true),

    school_id: SchoolNameField.with_options(),
    homeroom: HomeroomNameField.with_options(),

    created_at: Field::DateTime.with_options(),
    updated_at: Field::DateTime.with_options(),
    admin: YesNoBooleanField.with_options(),
    staff_type: Field::String.with_options(),
    schoolwide_access: YesNoBooleanField.with_options(),
    grade_level_access: PostgresArrayField.with_options(),
    restricted_to_sped_students: YesNoBooleanField.with_options(),
    restricted_to_english_language_learners: YesNoBooleanField.with_options(),
    can_view_restricted_notes: YesNoBooleanField.with_options(),
    districtwide_access: YesNoBooleanField.with_options(),
    can_set_districtwide_access: YesNoBooleanField.with_options(),
    active?: YesNoBooleanField.with_options(),
    missing_from_last_export: YesNoBooleanField.with_options()
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :full_name,
    :school_id,
    :active?,
    :schoolwide_access,
    :districtwide_access,
    :can_view_restricted_notes,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :email,
    :full_name,
    :local_id,
    :active?,
    :missing_from_last_export,

    :school_id,
    :homeroom,

    :admin,
    :grade_level_access,
    :restricted_to_sped_students,
    :restricted_to_english_language_learners,
    :schoolwide_access,
    :districtwide_access,
    :can_view_restricted_notes,
    :can_set_districtwide_access
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  #
  # This is also a safelist of what fields are accepted
  # from the client.
  # See https://github.com/thoughtbot/administrate/blob/master/app/controllers/administrate/application_controller.rb#L136
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
