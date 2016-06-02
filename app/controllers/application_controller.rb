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

  # Return the homepage path, depending on the educator's role
  def homepage_path_for_role(educator)
    if educator.schoolwide_access? || educator.has_access_to_grade_levels?
      school_url(educator.default_school)
    else
      default_homeroom_path(educator)
    end
  end

  def homepage_path_for_current_educator
    homepage_path_for_role(current_educator)
  end

  def default_homeroom_path(educator)
    homeroom_path(educator.default_homeroom)
  rescue Exceptions::NoAssignedHomeroom   # Thrown by educator without default homeroom
    no_homeroom_path
  rescue Exceptions::NoHomerooms
    no_homerooms_path
  end

  # Sugar for filters checking authorization
  def redirect_unauthorized!
    redirect_to not_authorized_path
  end

  # Used to wrap a block with timing measurements and logging, returning the value of the
  # block.
  #
  # Example: students = log_timing('load students') { Student.all }
  # Outputs: log_timing:end [load students] 2998ms
  def log_timing(message)
    return_value = nil

    logger.info "log_timing:start [#{message}]"
    timing_ms = Benchmark.ms { return_value = yield }
    logger.info "log_timing:end [#{message}] #{timing_ms.round}ms"

    return_value
  end
end
