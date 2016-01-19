class EducatorsController < ApplicationController

  def homepage
    if current_educator.admin?
      redirect_to school_url(current_educator.default_school_for_admin)
    else
      redirect_to_default_homeroom
    end
  end

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable

    respond_to do |format|
      format.json { render json: :ok }
    end
  end

end
