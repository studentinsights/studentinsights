class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  force_ssl unless Rails.env.development?

  before_action :authenticate_educator!  # Devise method

  def authenticate_admin!
    redirect_to(new_educator_session_path) unless current_educator.admin?
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
end
