class StudentsController < ApplicationController

  def sort_by_risk
    params = sorting_params
    @students_by_risk = Student.sort_by_risk(params)
    render json: @students_by_risk
  end

  def sorting_params
    params.require(:sort).permit(:subject, :lower_cutoff, :upper_cutoff, :room_id)
  end

end
