class SectionsController < ApplicationController
  before_action :authenticate_districtwide_access! # Extra authentication layer

  
  def index
    @courses = Course
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