class StudentsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new @student
    @attendance_events = @student.attendance_events.sort_by_school_year(@student)
    @discipline_incidents = @student.discipline_incidents.sort_by_school_year(@student)
  end

  def index
    @students = @homeroom.students
    # Order for dropdown menu of homerooms
    @homerooms_by_name = Homeroom.where.not(name: "Demo").order(:name)
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
