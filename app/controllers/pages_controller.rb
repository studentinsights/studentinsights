class PagesController < ApplicationController

  def index
    if pages_params.present?
      @room = Room.find_by_name(pages_params[:room])
    else
      @room = Room.first
    end
    @rooms_by_name = Room.all.sort_by { |r| r.name.to_i }.sort_by { |r| r.name.size }
    @students = Student.default_sort_by_math(@room)
    @number_of_students = @students.map {|k, v| v.length }.sum
    @risk_categories = [ "High", "Medium", "Low" ]
  end

  def about
  end

  def pages_params
    params.permit(:room)
  end

end
