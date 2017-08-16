class SectionsController < ApplicationController
  before_action :authorize_and_assign_section, only: :show
  before_action :authenticate_districtwide_access!, only: :index # Extra authentication layer
  
  def index
    #just setting this to all courses for now 
    #since we are only testing with district wide admins
    @educator_courses = Course.all.order(:course_number)
  end
  
  
  
  def show
    @serialized_data = {
      students: @current_section.students,
      educators: @current_section.educators,
      section: @current_section,
      course: @current_section.course,
      sections: current_educator.sections,
      current_educator: current_educator,
    }
  end

  private
  def authorize_and_assign_section    
    requested_section = Section.find(params[:id])

    if current_educator.sections.include? requested_section
      @current_section = requested_section
    else
      redirect_to homepage_path_for_role(current_educator)
    end
  rescue ActiveRecord::RecordNotFound     # Params don't match an actual section
    redirect_to homepage_path_for_role(current_educator)
  end

  def authenticate_districtwide_access!
    unless current_educator.districtwide_access
      redirect_to not_authorized_path
    end
  end
end