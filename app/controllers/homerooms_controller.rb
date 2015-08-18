class HomeroomsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    @students = @homeroom.students
    @homerooms_by_name = Homeroom.where.not(name: "Demo").order(:name)
    @current_school_year = SchoolYear.date_to_school_year(Time.new)
  end

  private

  def assign_homeroom
    @homeroom = Homeroom.friendly.find(params[:homeroom_id])
  rescue ActiveRecord::RecordNotFound
    if current_educator.homeroom.present?
      @homeroom = current_educator.homeroom
    else
      @homeroom = Homeroom.first
    end
  end

end
