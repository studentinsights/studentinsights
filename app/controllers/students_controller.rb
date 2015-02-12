class StudentsController < ApplicationController

  def sorting_params
    params.require(:sort).permit(:subject, :lower_cutoff, :upper_cutoff, :room_id)
  end

end
