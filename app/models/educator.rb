class Educator < ApplicationRecord
  devise :ldap_authenticatable_tiny, :rememberable, :trackable, :timeoutable, authentication_keys: [:login_text, :login_code]

  belongs_to  :school, optional: true # districtwide admin often don't have schools assigned
  has_one     :homeroom
  has_many    :students, through: :homeroom
  has_many    :educator_section_assignments
  has_many    :sections, through: :educator_section_assignments
  has_many    :section_students, source: :students, through: :sections
  has_many    :interventions
  has_many    :event_notes
  has_many    :transition_notes
  has_many    :educator_labels
  has_many    :login_activities, as: :user

  validates :email, presence: true, uniqueness: true, case_sensitive: false
  validates :login_name, presence: true, uniqueness: true, case_sensitive: false

  validate :validate_admin_gets_access_to_all_students,
           :validate_grade_level_access_is_array_of_strings,
           :validate_grade_level_strings_are_valid,
           :validate_grade_level_strings_are_uniq,
           :validate_grade_level_access_is_not_nil

  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12' ].freeze

  # Indicates the educator was missing from the last export where we expected to
  # find them, so we treat them as no longer active.
  #
  # Student Insights admin accounts are sometimes handled differently by districts,
  # so this enables those whitelisted accounts to be "active" regardless.
  #
  # `missing_from_last_export` will always reflect the SIS, while `active` is an
  # Insights concept.
  def self.active
    missing_arel = Educator.where(missing_from_last_export: false)
    login_name_arel = Educator.where(login_name: PerDistrict.new.educator_login_names_whitelisted_as_active())
    missing_arel.or(login_name_arel)
  end

  def active?
    (
      missing_from_last_export == false ||
      PerDistrict.new.educator_login_names_whitelisted_as_active().include?(login_name)
    )
  end

  def is_principal?
    staff_type.try(:downcase) == 'principal'
  end

  def is_authorized_for_student(student)
    Authorizer.new(self).is_authorized_for_student?(student)
  end

  def is_authorized_for_school(current_school)
    Authorizer.new(self).is_authorized_for_school?(current_school)
  end

  def is_authorized_for_section(section)
    Authorizer.new(self).is_authorized_for_section?(section)
  end

  def labels
    EducatorLabel.labels(self)
  end

  def default_section
    return sections[0] if sections.present?
    raise Exceptions::NoAssignedSections
  end

  def has_access_to_grade_levels?
    grade_level_access.present? && grade_level_access.size > 0
  end

  def allowed_sections
    Authorizer.new(self).sections
  end

  def self.to_index
    all.map { |e| [e.id, e.for_index] }.to_h
  end

  def for_index
    as_json.symbolize_keys.slice(:id, :email, :full_name)
  end

  private
  def validate_admin_gets_access_to_all_students
    has_access_to_all_students = (
      restricted_to_sped_students == false &&
      restricted_to_english_language_learners == false
    )
    errors.add(:admin, "needs access to all students") if admin? && !has_access_to_all_students
  end

  def validate_grade_level_access_is_array_of_strings
    unless grade_level_access.all? { |grade| grade.instance_of? String }
      errors.add(:grade_level_access, "should be an array of strings")
    end
  end

  def validate_grade_level_strings_are_valid
    if grade_level_access.any? { |grade| !(GradeLevels::ORDERED_GRADE_LEVELS.include?(grade)) }
      errors.add(:grade_level_access, "invalid grade")
    end
  end

  def validate_grade_level_strings_are_uniq
    unless grade_level_access.uniq.size == grade_level_access.size
      errors.add(:grade_level_access, "duplicate values")
    end
  end

  def validate_grade_level_access_is_not_nil
    errors.add(:grade_level_access, "cannot be nil") if grade_level_access.nil?
  end
end
