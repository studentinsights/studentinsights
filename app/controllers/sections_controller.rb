class SectionsController < ApplicationController
  before_action :authenticate_districtwide_access! # Extra authentication layer

  
  def index
    #just setting this to all courses for now 
    #since we are only testing with district wide admins
    @educator_courses = Course.all.order(:course_number)
  end
  
  def show
    @section = Section.find(params[:id])
  end


  private
  def authenticate_districtwide_access!
    unless current_educator.districtwide_access
      redirect_to not_authorized_path
    end
  end
end