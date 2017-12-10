class Educator < ActiveRecord::Base
  devise :rememberable, :trackable, :timeoutable

  if ::EnvironmentVariable.is_true('SHOULD_USE_LDAP')
    devise :ldap_authenticatable
  else
    devise :database_authenticatable
  end

  belongs_to  :school
  has_one     :homeroom
  has_many    :students, through: :homeroom
  has_many    :educator_section_assignments
  has_many    :sections, through: :educator_section_assignments
  has_many    :section_students, source: :students, through: :sections
  has_many    :interventions

  validates :email, presence: true, uniqueness: true

  validate :validate_has_school_unless_districtwide,
           :validate_admin_gets_access_to_all_students,
           :validate_grade_level_access_is_array_of_strings,
           :validate_grade_level_strings_are_valid,
           :validate_grade_level_strings_are_uniq,
           :validate_grade_level_access_is_not_nil

  # TODO(kr) this probably needs to be updated, there are a few copies of this
  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12' ].freeze

  # override
  # The `student_searchbar_json` field can be really heavy (~500kb), and
  # there's no circumstances where we want to include it when serializing
  # an educator model.  So override `as_json` to omit it by default.
  def as_json(options = {})
    super(options.merge({ except: [:student_searchbar_json] }))
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

  def students_for_school_overview(*additional_includes)
    students = Authorizer.new(self).students_for_school_overview
    if students.respond_to?(:includes)
      students.includes(additional_includes || [])
    elsif students.size == 0
      logger.warn("Fell through to empty array in #students_for_school_overview for educator_id: #{self.id}")
    else
      students
    end
  end

  def default_homeroom
    raise Exceptions::NoHomerooms if Homeroom.count == 0    # <= We can't show any homerooms if there are none
    return homeroom if homeroom.present?                    # <= Logged-in educator has an assigned homeroom
    raise Exceptions::NoAssignedHomeroom                    # <= Logged-in educator has no assigned homeroom
  end

  def default_section
    raise Exceptions::NoSections if Section.count == 0    # <= We can't show any sectionss if there are none
    return sections[0] if sections.present?                      # <= Logged-in educator has at least one assigned section
    raise Exceptions::NoAssignedSections                    # <= Logged-in educator has no assigned section
  end

  # TODO(kr) flagged for next pass
  def has_access_to_grade_levels?
    grade_level_access.present? && grade_level_access.size > 0
  end

  def allowed_homerooms
    Authorizer.new(self).homerooms
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

  def self.save_student_searchbar_json
    find_each { |educator| educator.save_student_searchbar_json }
  end

  def self.save_student_searchbar_json_for_folks_who_log_in
    educators_who_log_in = Educator.where("sign_in_count > ?", 0)

    educators_who_log_in.find_each { |e| e.save_student_searchbar_json }
  end

  def save_student_searchbar_json
    self.student_searchbar_json = SearchbarHelper.names_for(self).to_json
    save!
  end

  private
  def validate_has_school_unless_districtwide
    if school.blank?
      errors.add(:school_id, "must be assigned a school") unless districtwide_access?
    end
  end

  def validate_admin_gets_access_to_all_students
    has_acces_to_all_students = (
      restricted_to_sped_students == false &&
      restricted_to_english_language_learners == false
    )
    errors.add(:admin, "needs access to all students") if admin? && !has_acces_to_all_students
  end

  def validate_grade_level_access_is_array_of_strings
    unless grade_level_access.all? { |grade| grade.instance_of? String }
      errors.add(:grade_level_access, "should be an array of strings")
    end
  end

  def validate_grade_level_strings_are_valid
    if grade_level_access.any? { |grade| !(VALID_GRADES.include?(grade)) }
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
