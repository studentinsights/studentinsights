require 'csv'

class StudentsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new @student
    @chart_data = @student.chart_data

    @roster_url = homeroom_students_path(@student.homeroom)
    @csv_url = student_path(@student) + ".csv"
    @student_url = student_path(@student)

    respond_to do |format|
      format.html
      format.csv { render csv: @student.profile_csv_export, filename: 'export' }
      format.pdf { render text: PDFKit.new(@student_url).to_pdf }
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
