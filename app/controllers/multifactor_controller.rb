class MultifactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:send_code]

  # POST
  def send_code
    raise Exceptions::EducatorNotAuthorized if signed_in?
    safe_params = params.permit(:login_text)

    desired_milliseconds = 3000
    ConsistentTiming.new.enforce_timing(desired_milliseconds) do
      maybe_send_code!(safe_params[:login_text])
    end

    render json: { status: 'ok' }, status: 201 # no feedback
  end

  private
  def maybe_send_login_code!(login_text)    
    educator = PerDistrict.new.find_educator_by_login_text(safe_params[:login_text].downcase.strip)
    if educator.present?
      # if no number, tell them in UI and email them
      TwoFactorEducator.new.send!(educator.id) # handle errors
    end
  end
end
