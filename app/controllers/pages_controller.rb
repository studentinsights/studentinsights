class PagesController < ApplicationController

  def index
    @room = Room.all.sample
    @rooms_by_name = Room.all.sort_by { |r| r.name.to_i }.sort_by { |r| r.name.size }
    @students = Student.default_sort_by_math(@room)
    @number_of_students = @students.map {|k, v| v.length }.sum
    @risk_categories = [ "High", "Medium", "Low" ]
  end

end
