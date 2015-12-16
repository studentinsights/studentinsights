class EducatorsController < ApplicationController

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable

    respond_to do |format|
      format.json { render json: :ok }
    end
  end

end
