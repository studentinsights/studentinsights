class StudentsController < ApplicationController

  before_action :authenticate_user!

  def index
    if room_params.present?
      @room = Room.find_by_name(room_params[:room])
    else
      @room = Room.first || Room.create(name: "100")
    end

    @students = @room.students
    @sorted_students = Student.default_sort(@students)
    @number_of_students = @students.size
    @risk_categories = [ "High", "Medium", "Low" ]

    # Order rooms for dropdown menu of homerooms
    @rooms_by_name = Room.order(:name)
  end

  def room_params
    params.permit(:room)
  end

end
