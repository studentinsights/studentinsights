class StudentsController < ApplicationController

  before_action :authenticate_user!

  def index
    if room_params.present?
      @room = Room.find_by_name(room_params[:room])
    else
      if Room.first.present?  
        @room = Room.first
      else
        @room = Room.create(name: "100")
      end
    end
    @rooms_by_name = Room.all.sort_by { |r| r.name.to_i }.sort_by { |r| r.name.size }
    @students = Student.default_sort_by_math(@room)
    @number_of_students = @students.map {|k, v| v.length }.sum
    @risk_categories = [ "High", "Medium", "Low" ]
  end

  def room_params
    params.permit(:room)
  end

end
