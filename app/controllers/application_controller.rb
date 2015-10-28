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

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
end
