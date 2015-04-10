class PagesController < ApplicationController

  def about
  end

  def roster_demo
    @number_of_students = 12
    @students = []

    @number_of_students.times do 
      student = Student.new(Student.fake_data)
      @students << student
      student.student_results.build(StudentResult.fake_data)
    end
    @risk_categories = [ "High", "Medium", "Low" ]
    @sorted_students = Student.default_sort(@students)

    @room = Room.where(name: "Demo").first_or_create
    @rooms_by_name = [@room]
    render "students/index"
  end

end
