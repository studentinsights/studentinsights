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

  def default_homeroom
    raise Exceptions::NoHomerooms if Homeroom.count == 0    # <= We can't show any homerooms if there are none
    return homeroom if homeroom.present?                    # <= Logged-in educator has an assigned homeroom
    raise Exceptions::NoAssignedHomeroom                    # <= Logged-in educator has no assigned homeroom
  end

  def default_school_for_admin
    school || School.first
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

  def self.summary
    puts; puts "=== EDUCATOR REPORT ==="

    puts; puts "=== Admins:"
    puts Educator.where(admin: true).pluck(:full_name)

    puts; puts "=== Non-admins with school-wide access:"
    puts Educator.where(admin: false, schoolwide_access: true).pluck(:full_name)

    puts; puts "=== Staff members with grade level-based access:"
    Educator.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.homeroom.blank? }
            .select { |e| e.grade_level_access.size > 0 }
            .each do |educator|
      puts "#{educator.full_name} -- #{educator.grade_level_access}"
    end

    puts; puts "=== Staff members limited to student profiles of ELLs:"
    puts Educator.where(restricted_to_english_language_learners: true).pluck(:full_name)

    puts; puts "=== Staff members limited to student profiles of SPED students:"
    puts Educator.where(restricted_to_sped_students: true).pluck(:full_name)

    puts; puts "=== Homeroom teachers:"
    Educator.all.select { |e| e.homeroom.present? }.each do |educator|
      puts "#{educator.full_name} -- #{educator.homeroom.name} -- Grade #{educator.homeroom.grade}"
    end

    puts; puts "=== Without any authorizations:"
    Educator.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.grade_level_access.empty? }
            .select { |e| e.homeroom.blank? }
            .each do |educator|
      puts educator.full_name
    end

    return
  end

end
