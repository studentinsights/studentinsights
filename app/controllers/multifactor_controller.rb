class MultifactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:multifactor]

  # POST
  # If it's an educator, and if they have multifactor enabled, and if the
  # multifactor form is SMS, then send a login code via SMS.
  # Aborts early if the user is already authenticated, but other than that there
  # is no no feedback to the client for security.
  def multifactor
    raise Exceptions::EducatorNotAuthorized if signed_in?
    safe_params = params.require(:multifactor).permit(:login_text)

    # Keep consistent response times for security
    ConsistentTiming.new.enforce_timing(desired_milliseconds) do
      maybe_send_login_code!(safe_params[:login_text])
    end

    head :no_content # no feedback for security
  end

  private
  def desired_milliseconds
    ENV.fetch('CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS', 2000.to_s).to_i
  end

  # no feedback for security
  def maybe_send_login_code!(login_text)
    return nil if login_text.nil?

    educator = PerDistrict.new.find_educator_by_login_text(login_text.downcase.strip)
    return nil if educator.nil?

    authenticator = MultifactorAuthenticator.new(educator)
    return nil unless authenticator.is_multifactor_enabled?

    authenticator.send_login_code_if_necessary!
    nil
  end
end
