class ApplicationController < ActionController::Base

  rescue_from DeviseLdapAuthenticatable::LdapException do |exception|
    render text: exception, status: 500
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  force_ssl unless Rails.env.development?

  before_action :authenticate_educator!  # Devise method, applies to all controllers.
                                         # In this app 'users' are 'educators'.

  def authenticate_admin!
    # Some controllers are just for admins (principals + district admins).
    # For example, the school-wide dashboard, which includes data and
    # links to student profiles from different classrooms and grade levels.
    redirect_to(new_educator_session_path) unless current_educator.admin?
  end

  # Return the homepage path, depending on the educator's role
  def homepage_path_for_role(educator)
    if educator.admin?
      school_url(educator.default_school_for_admin)
    else
      default_homeroom_path(educator)
    end
  end

  def default_homeroom_path(educator)
    homeroom_path(educator.default_homeroom)
  rescue Exceptions::NoAssignedHomeroom   # Thrown by educator without default homeroom
    no_homeroom_path
  rescue Exceptions::NoHomerooms
    no_homerooms_path
  end
end
