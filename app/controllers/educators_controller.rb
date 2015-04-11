class EducatorsController < ApplicationController

  def educators_params
    params.require(:educator).permit(:email)
  end

end