class ApplicationController < ActionController::Base

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  force_ssl unless Rails.env.development?

  before_action :redirect_domain!
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :authenticate_educator!  # Devise method, applies to all controllers (in this app 'users' are 'educators')

  rescue_from ActiveRecord::RecordNotFound do
    if request.format.json?
      render_not_found_json!
    else
      redirect_to home_path
    end
  end

  rescue_from Exceptions::EducatorNotAuthorized do
    if request.format.json?
      render_unauthorized_json!
    else
      redirect_unauthorized!
    end
  end

  # This overrides `current_educator` to enable masquerading as other users.
  # It's factored out to be re-used by Administrate, which doesn't inherit
  # from `ApplicationController`.
  include MasqueradeHelpers
  helper_method :masquerade

  def homepage_path_for_role(educator)
    home_path # /home
  end

  # Wrap all database queries with this to enforce authorization
  def authorized(&block)
    authorizer.authorized(&block)
  end

  # Enforce authorization and raise if no authorized models
  def authorized_or_raise!(&block)
    return_value = authorizer.authorized(&block)
    if return_value == nil || return_value == []
      raise Exceptions::EducatorNotAuthorized
    end
    return_value
  end

  def render_unauthorized_json!
    render json: { error: 'unauthorized' }, status: 403
  end

  def render_not_found_json!
    render json: { error: 'not_found' }, status: 404
  end

  # For redirecting requests directly from the Heroku domain to the canonical domain name
  def redirect_domain!
    canonical_domain = LoadDistrictConfig.new.canonical_domain
    return if canonical_domain == nil
    return if request.host == canonical_domain
    redirect_to "#{request.protocol}#{canonical_domain}#{request.fullpath}", :status => :moved_permanently
  end

  def redirect_unauthorized!
    redirect_to not_authorized_path
  end

  # Used to wrap a block with timing measurements and logging, returning the value of the
  # block.
  #
  # Example: students = log_timing('load students') { Student.active }
  # Outputs: log_timing:end [load students] 2998ms
  def log_timing(message)
    return_value = nil

    logger.info "log_timing:start [#{message}]"
    timing_ms = Benchmark.ms { return_value = yield }
    logger.info "log_timing:end [#{message}] #{timing_ms.round}ms"

    return_value
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:login_username])
  end

  private
  def authorizer
    @authorizer ||= Authorizer.new(current_educator)
  end
end
