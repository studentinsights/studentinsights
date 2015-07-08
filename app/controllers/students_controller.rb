require 'csv'

class StudentsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new @student
    profile = @student.profile_data

    @attendance_events = profile[:attendance_events]
    @discipline_incidents = profile[:discipline_incidents]
    @mcas_results = profile[:mcas_results]
    @star_results = profile[:star_results]
    @roster_url = homeroom_students_path(@student.homeroom)

    respond_to do |format|
      format.html
      format.csv do
        render csv: @student.profile_csv_export, filename: 'export'
      end
    end
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
