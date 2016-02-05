class Educator < ActiveRecord::Base
  devise :rememberable, :trackable, :timeoutable

  if Rails.env.development? || ENV['DEMO_SITE']
    devise :database_authenticatable
  else
    devise :ldap_authenticatable
  end

  belongs_to  :school
  has_one     :homeroom
  has_many    :students, through: :homeroom
  has_many    :interventions
  has_many    :progress_notes, through: :interventions
  has_many    :student_notes

  validates :email, presence: true, uniqueness: true
  validates :local_id, presence: true, uniqueness: true

  def students_for_school_overview(*additional_includes)
    return unless school.present?

    default_eager_loads = [ :interventions, :student_risk_level, :homeroom, :student_school_years ]
    eager_loads = default_eager_loads + additional_includes

    if schoolwide_access?
      school.students
            .includes(eager_loads)
    elsif has_access_to_grade_levels?
      school.students
            .where(grade: current_educator.grade_level_access)
            .includes(eager_loads)
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

end
