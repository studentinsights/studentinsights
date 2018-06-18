# This class provides an API for interacting with Warden
# sessions so that we can store values allowing users with elevated
# permissions to masquerade as another user.
#
# This class is responsible for controlling this, and controller
# code can read this, or use its methods to change states.  The other key
# piece is `MasqueradeHelpers`, which is mixed into `ApplicationController`
# to override the `current_educator` method.
class Masquerade
  def initialize(session, underlying_current_educator_lambda)
    @session = session
    @underlying_current_educator_lambda = underlying_current_educator_lambda
    @session_key = 'masquerade.masquerading_educator_id'
  end

  # Any user can check this
  def authorized?
    allowed_by_env? && underlying_current_educator.present? && underlying_current_educator.can_set_districtwide_access?
  end

  # Any user can check this
  def is_masquerading?
    allowed_by_env? && @session.has_key?(@session_key)
  end

  # Raise if:
  # - they don't have access
  # - if they're already masquerading as someone else (clear first)
  # - they are trying to masquerade as themselves (potential for confusion)
  def become_educator_id!(masquerading_educator_id)
    raise Exceptions::EducatorNotAuthorized unless authorized?
    raise Exceptions::EducatorNotAuthorized if is_masquerading?
    raise Exceptions::EducatorNotAuthorized if masquerading_educator_id == underlying_current_educator.id
    @session[@session_key] = masquerading_educator_id
    nil
  end

  # Safe to call if not masquerading
  def clear!
    raise Exceptions::EducatorNotAuthorized unless authorized?
    @session.delete(@session_key)
    nil
  end

  def current_educator
    raise Exceptions::EducatorNotAuthorized unless authorized?
    raise Exceptions::EducatorNotAuthorized unless is_masquerading?
    Educator.find(@session[@session_key])
  end

  private
  # Kill switch for disabling masquerading globally
  def allowed_by_env?
    EnvironmentVariable.is_true('ENABLE_MASQUERADING')
  end

  def underlying_current_educator
    @underlying_current_educator_lambda.call
  end
end
