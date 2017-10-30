class ApplicationController < ActionController::Base

  rescue_from DeviseLdapAuthenticatable::LdapException do |exception|
    render text: exception, status: 500
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  unless Rails.env.development?
    force_ssl except: [:lets_encrypt_endpoint]
  end

  before_action :redirect_domain!
  before_action :authenticate_educator!  # Devise method, applies to all controllers.
                                         # In this app 'users' are 'educators'.
  before_action :inject_authorized!

  # Return the homepage path, depending on the educator's role
  def homepage_path_for_role(educator)
    if educator.districtwide_access?
      educators_districtwide_url
    elsif educator.schoolwide_access? || educator.has_access_to_grade_levels?
      school_url(educator.school)
    elsif educator.school.school_type == 'HS'
      default_section_path(educator)
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

  def default_section_path(educator)
    section_path(educator.default_section)
  rescue Exceptions::NoAssignedSections   # Thrown by educator without any sections
    no_section_path
  rescue Exceptions::NoSections
    no_sections_path
  end

  # Used to make all database queries
  def authorized
    @authorized
  end

  # Sugar for filters checking authorization
  def redirect_unauthorized!
    redirect_to not_authorized_path
  end

  def render_unauthorized_json!
    render json: { error: 'unauthorized' }, status: 403
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

  private
  # For redirecting requests directly from the Heroku domain to the canonical domain name
  def redirect_domain!
    canonical_domain = EnvironmentVariable.value('CANONICAL_DOMAIN')
    return if canonical_domain == nil
    return if request.host == canonical_domain
    redirect_to "#{request.protocol}#{canonical_domain}#{request.fullpath}", :status => :moved_permanently
  end

  def inject_authorized!
    @authorized = Authorized.new(current_educator)
  end
end
