class MultifactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:send_code]

  # POST
  def send_code
    raise Exceptions::EducatorNotAuthorized if signed_in?
    safe_params = params.require(:multifactor).permit(:login_text)

    # Keep consistent response times for security
    desired_milliseconds = 3000
    ConsistentTiming.new.enforce_timing(desired_milliseconds) do
      maybe_send_login_code!(safe_params[:login_text])
    end

    render json: { status: 'ok' }, status: 201 # no feedback for security
  end

  private
  # no feedback for security
  def maybe_send_login_code!(login_text)
    educator = PerDistrict.new.find_educator_by_login_text(login_text.downcase.strip)
    return if educator.nil?
    MultifactorAuthenticator.new(educator).send_login_code_via_sms!
    nil
  end
end
