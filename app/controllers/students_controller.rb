class StudentsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def index
    @students = @homeroom.students
    @sorted_students = Student.default_sort(@students)
    @number_of_students = @students.size
    @risk_categories = [ "High", "Medium", "Low" ]

    @mcas = Assessment.where(name: "MCAS").order(:year).last
    @star = Assessment.where(name: "STAR").order(:year).last

    # Order for dropdown menu of homerooms
    @homerooms_by_name = Homeroom.order(:name)
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
