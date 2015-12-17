class SchoolsController < ApplicationController

  def show
    school = School.find(params[:id])
    @data = school.equity_data
    @absence_concerns = @data[:attendance][:top_absence_concerns]
    @tardy_concerns = @data[:attendance][:top_tardy_concerns]
  end

end
