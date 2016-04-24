class EducatorsController < ApplicationController

  # Authentication by default inherited from ApplicationController.

  def homepage
    redirect_to homepage_path_for_role(current_educator)
  end

  def names_for_dropdown
    student = Student.find(params[:id])
    school = student.school

    if school.nil?
      render json: [] and return
    end

    render json: (school.educator_names_for_services + Service.provider_names).uniq.compact.sort_by(&:downcase)
  end

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable

    respond_to do |format|
      format.json { render json: :ok }
    end
  end

end
