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
    return Homeroom.first if admin?
    return homeroom if homeroom.present?
    raise "no homeroom"
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
