class TwoFactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:send_two_factor]  # Inherited from ApplicationController

  # POST
  # if the user is signed in, should raise
  def send_two_factor
    safe_params = params.permit(:login_text)
    educator = PerDistrict.new.find_educator_by_login_text(safe_params[:login_text].downcase.strip)
    if educator.present?
      # if no number, tell them in UI and email them
      TwoFactorEducator.new.send!(educator.id) # handle errors
    end
    render json: { status: 'ok' }
  end
end
