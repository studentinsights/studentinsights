class Educator < ActiveRecord::Base
  devise :rememberable, :trackable, :timeoutable

  if EnvironmentVariable.is_true('SHOULD_USE_LDAP')
    devise :ldap_authenticatable
  else
    devise :database_authenticatable
  end

  belongs_to  :school
  has_one     :homeroom
  has_many    :students, through: :homeroom
  has_many    :interventions

  validates :email, presence: true, uniqueness: true
  validates :school, presence: true

  validate :admin_gets_access_to_all_students,
           :grade_level_access_is_array_of_strings,
           :grade_level_strings_are_valid,
           :grade_level_strings_are_uniq,
           :grade_level_access_is_not_nil

  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ].freeze

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
    return false if self.school.present? && self.school != student.school

    return true if self.schoolwide_access? || self.admin? # Schoolwide admin
    return true if self.has_access_to_grade_levels? && student.grade.in?(self.grade_level_access) # Grade level access
    return true if student.in?(self.students) # Homeroom level access
    false
  end

  def students_for_school_overview(*additional_includes)
    return [] unless school.present?

    default_eager_loads = [ :interventions, :student_risk_level, :homeroom, :student_school_years ]
    eager_loads = default_eager_loads + additional_includes

    if schoolwide_access?
      school.students
            .active
            .includes(eager_loads)
    elsif has_access_to_grade_levels?
      school.students
            .active
            .where(grade: grade_level_access)
            .includes(eager_loads)
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

  def default_school
    school || School.with_students.first
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

  def clone_permissions_from(educator_full_name)
    # Useful for debugging and QA on staff with different schools & permissions

    target_educator = Educator.find_by_full_name(educator_full_name)
    permissions = target_educator.permissions_hash
    assign_attributes(permissions)
    save!
  end

  def clone_permissions_and_homeroom_in_staging_from(educator_full_name)
    # :alert: do not use in production :alert:
    # This will change whom the homeroom belongs to!

    target_educator = Educator.find_by_full_name(educator_full_name)
    permissions = target_educator.permissions_hash
    assign_attributes(permissions)
    save!

    target_homeroom = target_educator.homeroom
    target_homeroom.educator = self
    target_homeroom.save!
  end

  def self.load_permissions(permissions_array)
    # Expects an array of hashes:
    # [{
    #   full_name: EDUCATOR_FULL_NAME_1,
    #   PERMISSIONS_ATTRIBUTES
    # },
    # {
    #   full_name: EDUCATOR_FULL_NAME_2,
    #   PERMISSIONS_ATTRIBUTES
    # }]

    permissions_array.each do |permissions_info|
      educator = Educator.find_by_full_name!(permissions_info[:full_name])
      educator.assign_attributes(permissions_info)
      educator.save!
    end
  end

  def self.print_permissions
    # Useful for double-checking permissions levels with Somerville admins

    Educator.order(:school_id, :full_name).each do |educator|
      puts "#{educator.full_name} (#{educator.school.local_id}):"
      puts educator.permissions_in_words
      puts
    end

    return
  end

  def permissions_in_words
    return "No access" if has_access_to_no_students?

    permissions = []
    permissions << "Has access to homeroom #{homeroom.name}" if homeroom.present?
    permissions << "Has schoolwide access" if schoolwide_access?
    permissions << "Has grade level access to #{grade_level_access}" if has_grade_level_access?

    return permissions
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
    restricted_to_english_language_learners == false &&
    schoolwide_access == true
  end

end
