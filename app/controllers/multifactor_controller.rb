class MultifactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:send_code]

  # POST
  def send_code
    raise Exceptions::EducatorNotAuthorized if signed_in?
    safe_params = params.require(:multifactor).permit(:login_text)

    # Keep consistent response times for security
    ConsistentTiming.new.enforce_timing(desired_milliseconds) do
      maybe_send_login_code!(safe_params[:login_text])
    end

    render json: { status: 'ok' }, status: 201 # no feedback for security
  end

  private
  def desired_milliseconds
    ENV.fetch('CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS', 3000.to_s).to_i
  end

  # no feedback for security
  def maybe_send_login_code!(login_text)
    educator = PerDistrict.new.find_educator_by_login_text(login_text.downcase.strip)
    return nil if educator.nil?

    authenticator = MultifactorAuthenticator.new(educator)
    return nil unless authenticator.is_multifactor_enabled?

    authenticator.send_login_code_via_sms!
    nil
  end
end
