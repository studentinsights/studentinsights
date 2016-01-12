class Educator < ActiveRecord::Base
  devise :rememberable, :trackable, :timeoutable
  devise :ldap_authenticatable if Rails.env.production? || Rails.env.test?          # Mock LDAP in test suite.

  devise :database_authenticatable if Rails.env.development? || ENV['DEMO_SITE']    # Don't make real LDAP
                                                                                    # queries in development
                                                                                    # mode or on the demo site.
  has_one :homeroom
  has_many :students, through: :homeroom
  has_many :interventions
  has_many :progress_notes, through: :interventions
  has_many :student_notes

  def default_homeroom
    raise Exceptions::NoHomerooms if Homeroom.count == 0    # <= We can't show any homerooms if there are none
    return Homeroom.first if admin?                         # <= Pick a homeroom to show admin (change to admin dashboard when it's ready)
    return homeroom if homeroom.present?                    # <= Logged-in educator has an assigned homeroom
    raise Exceptions::NoAssignedHomeroom                    # <= Logged-in educator has no assigned homeroom
  end

  def allowed_homerooms
    # Educator can visit roster view for these homerooms
    # For non-admins, all homerooms at their homeroom's grade level

    if admin?
      Homeroom.all
    elsif homeroom
      # Once the app includes data for multiple schools, will
      # need to scope by school as well as by grade level
      Homeroom.where(grade: homeroom.grade)
    else
      []
    end
  end

  def allowed_homerooms_by_name
    allowed_homerooms.order(:name)
  end

end
