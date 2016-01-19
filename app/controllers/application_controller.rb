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

  private

  def authorize_and_assign_homeroom
    @requested_homeroom = Homeroom.friendly.find(params[:id])

    if current_educator.allowed_homerooms.include? @requested_homeroom
      @homeroom = @requested_homeroom
    else
      redirect_to_default_homeroom
    end
  rescue ActiveRecord::RecordNotFound     # Params don't match an actual homeroom
    redirect_to_default_homeroom
  end

  def redirect_to_default_homeroom
    redirect_to homeroom_path(current_educator.default_homeroom)
  rescue Exceptions::NoAssignedHomeroom   # Thrown by educator without default homeroom
    redirect_to no_homeroom_path
  rescue Exceptions::NoHomerooms
    redirect_to no_homerooms_path
  end
end
