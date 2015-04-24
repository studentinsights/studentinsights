class PagesController < ApplicationController

  def about
  end

  def roster_demo
    @number_of_students = 12
    @students = []

    @number_of_students.times do 
      student = Student.new(Student.fake_data)
      @students << student
      student.mcas_results.build(McasResult.fake_data)
    end
    @risk_categories = [ "High", "Medium", "Low" ]
    @sorted_students = Student.default_sort(@students)

    @mcas = Assessment.new(name: "MCAS", year: Time.new(2015))
    @star = Assessment.new(name: "STAR", year: Time.new(2015))

    @homeroom = Homeroom.where(name: "Demo").first_or_create
    @homerooms_by_name = [@homeroom]
    render "students/index"
  end

end
