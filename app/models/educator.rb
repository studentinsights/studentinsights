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
  has_many    :progress_notes, through: :interventions
  has_many    :student_notes

  validates :email, presence: true, uniqueness: true
  validates :local_id, presence: true, uniqueness: true
  validate :admin_gets_access_to_all_students

  def admin_gets_access_to_all_students
    errors.add(:admin, "needs access to all students") if admin? && !has_access_to_all_students?
  end

  # This method is the source of truth for whether an educator is authorized to view information about a particular
  # student.
  def is_authorized_for_student(student)
    return false if self.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
    return false if self.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'

    return true if self.schoolwide_access? # Schoolwide admin
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
    school || School.first
  end

  def has_access_to_grade_levels?
    grade_level_access.present? && grade_level_access.size > 0
  end

  def allowed_homerooms
    # Educator can visit roster view for these homerooms
    # For non-admins, all homerooms at their homeroom's grade level

    if schoolwide_access?
      Homeroom.all
    elsif homeroom
      # Once the app includes data for multiple schools, will
      # need to scope by school as well as by grade level
      Homeroom.where(grade: homeroom.grade)
    elsif grade_level_access.present?
      Homeroom.where(grade: grade_level_access)
    else
      []
    end
  end

  def allowed_homerooms_by_name
    allowed_homerooms.order(:name)
  end

  private

  def has_access_to_all_students?
    restricted_to_sped_students == false &&
    restricted_to_english_language_learners == false &&
    schoolwide_access == true
  end

end
