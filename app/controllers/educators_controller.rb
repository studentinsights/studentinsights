class EducatorsController < ApplicationController

  # Authentication by default inherited from ApplicationController.

  def homepage
    redirect_to homepage_path_for_role(current_educator)
  end

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable

    respond_to do |format|
      format.json { render json: :ok }
    end
  end

end
