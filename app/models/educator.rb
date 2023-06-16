class Educator < ApplicationRecord
  devise :ldap_authenticatable_tiny, :rememberable, :trackable, :timeoutable, authentication_keys: [:login_text, :login_code]

  belongs_to  :school, optional: true # eg, districtwide admin often don't have schools assigned
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

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :login_name, presence: true, uniqueness: { case_sensitive: false }

  validate :validate_admin_gets_access_to_all_students
  validate :validate_grade_level

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

  def labels(options = {})
    EducatorLabel.labels(self, options).sort
  end

  # deprecated, migrate to Authorizer
  def has_access_to_grade_levels?
    grade_level_access.present? && grade_level_access.size > 0
  end

  # deprecated, migrate callers to use the Authorizer class directly
  def is_authorized_for_student(student)
    Authorizer.new(self).is_authorized_for_student?(student)
  end

  # deprecated, move to controller or standalone class
  def self.to_index
    all.map do |e|
      json = e.as_json.symbolize_keys.slice(:id, :email, :full_name)
      [e.id, json]
    end.to_h
  end

  private
  # TODO(kr) deprecated, see offline
  def validate_admin_gets_access_to_all_students
    has_access_to_all_students = (
      restricted_to_sped_students == false &&
      restricted_to_english_language_learners == false
    )
    errors.add(:admin, "needs access to all students") if admin? && !has_access_to_all_students
  end

  def validate_grade_level
    if grade_level_access.nil?
      errors.add(:grade_level_access, "cannot be nil") if grade_level_access.nil?
    elsif grade_level_access.class != Array
      errors.add(:grade_level_access, "should be an array, containing strings")
    elsif grade_level_access.any? { |grade| !(GradeLevels::ORDERED_GRADE_LEVELS.include?(grade)) }
      errors.add(:grade_level_access, "invalid grade")
    elsif grade_level_access.uniq.size != grade_level_access.size
      errors.add(:grade_level_access, "duplicate values")
    end
  end
end
