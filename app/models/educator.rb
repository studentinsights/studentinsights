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

  validate :has_school_unless_districtwide,
           :admin_gets_access_to_all_students,
           :grade_level_access_is_array_of_strings,
           :grade_level_strings_are_valid,
           :grade_level_strings_are_uniq,
           :grade_level_access_is_not_nil

  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ].freeze

  # override
  # The `student_searchbar_json` field can be really heavy (~500kb), and
  # there's no circumstances where we want to include it when serializing
  # an educator model.  So override `as_json to omit it by default.
  def as_json(options = {})
    super(options.merge({ except: [:student_searchbar_json] }))
  end

  def has_school_unless_districtwide
    if school.blank?
      errors.add(:school_id, "must be assigned a school") unless districtwide_access?
    end
  end

  def admin_gets_access_to_all_students
    errors.add(:admin, "needs access to all students") if admin? && !has_access_to_all_students?
  end

  def grade_level_access_is_array_of_strings
    unless grade_level_access.all? { |grade| grade.instance_of? String }
      errors.add(:grade_level_access, "should be an array of strings")
    end
  end

  def grade_level_strings_are_valid
    if grade_level_access.any? { |grade| !(VALID_GRADES.include?(grade)) }
      errors.add(:grade_level_access, "invalid grade")
    end
  end

  def grade_level_strings_are_uniq
    unless grade_level_access.uniq.size == grade_level_access.size
      errors.add(:grade_level_access, "duplicate values")
    end
  end

  def grade_level_access_is_not_nil
    errors.add(:grade_level_access, "cannot be nil") if grade_level_access.nil?
  end

  # This method is the source of truth for whether an educator is authorized to view information about a particular
  # student.
  def is_authorized_for_student(student)
    return true if self.districtwide_access?

    return false if self.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
    return false if self.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'
    return false if self.school_id.present? && self.school_id != student.school_id

    return true if self.schoolwide_access? || self.admin? # Schoolwide admin
    return true if self.has_access_to_grade_levels? && student.grade.in?(self.grade_level_access) # Grade level access
    return true if student.in?(self.students) # Homeroom level access
    return true if student.in?(self.section_students) # Section level access
    false
  end

  def is_authorized_for_school(currentSchool)
    self.districtwide_access? ||
    (self.schoolwide_access? && self.school == currentSchool) ||
    (self.has_access_to_grade_levels? && self.school == currentSchool)
  end

  def is_authorized_for_section(section)
    return true if self.districtwide_access?

    return false if self.school.present? && self.school != section.course.school

    return true if self.schoolwide_access? || self.admin?
    return true if section.in?(self.sections)
    false
  end

  def students_for_school_overview(*additional_includes)
    return [] unless school.present?

    if schoolwide_access?
      school.students
            .active
            .includes(additional_includes || [])
    elsif has_access_to_grade_levels?
      school.students
            .active
            .where(grade: self.grade_level_access)
            .includes(additional_includes || [])
    else
      logger.warn("Fell through to empty array in #students_for_school_overview for educator_id: #{self.id}")
      []
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

  def has_access_to_grade_levels?
    grade_level_access.present? && grade_level_access.size > 0
  end

  def allowed_homerooms
    # Educator can visit roster view for these homerooms
    return [] if school.nil?

    if districtwide_access?
      Homeroom.all
    elsif schoolwide_access?
      school.homerooms.all
    elsif homeroom
      school.homerooms.where(grade: homeroom.grade)
    elsif grade_level_access.present?
      school.homerooms.where(grade: grade_level_access)
    else
      []
    end
  end

  def allowed_sections
    if districtwide_access?
      Section.all
    elsif schoolwide_access?
      Section.joins(:course).where('courses.school_id = ?', school.id)
    else
      sections
    end
  end

  def allowed_homerooms_by_name
    allowed_homerooms.order(:name)
  end

  def self.to_index
    all.map { |e| [e.id, e.for_index] }.to_h
  end

  def for_index
    as_json.symbolize_keys.slice(:id, :email, :full_name)
  end

  def permissions_hash
    {
      admin: admin,
      school: school,
      schoolwide_access: schoolwide_access,
      grade_level_access: grade_level_access,
      restricted_to_sped_students: restricted_to_sped_students,
      restricted_to_english_language_learners: restricted_to_english_language_learners,
    }
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

  def has_access_to_no_students?
    schoolwide_access == false && grade_level_access == [] && homeroom.blank?
  end

  def has_grade_level_access?
    grade_level_access != [] && !grade_level_access.nil?
  end

  def has_access_to_all_students?
    restricted_to_sped_students == false &&
    restricted_to_english_language_learners == false
  end

end
