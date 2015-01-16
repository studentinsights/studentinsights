class PagesController < ApplicationController

  def index
    @room = Room.all.sample
    @students = Student.default_sort_by_math(@room)
    @number_of_students = @students.map {|k, v| v.length }.sum
    @risk_categories = [ "High", "Medium", "Low" ]
  end

end
