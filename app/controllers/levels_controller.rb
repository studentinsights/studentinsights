class LevelsController < ApplicationController
  before_action :ensure_feature_enabled_for_district!

  def show_json
    params.require(:school_id)
    params.permit(:time_now)
    school_id = (School.find_by_slug(params[:school_id]) || School.find_by_id(params[:school_id])).id
    time_now = time_now_or_param(params[:time_now])

    levels = SomervilleHighLevels.new
    students_with_levels_json = levels.students_with_levels_json(current_educator, [school_id], time_now)
    render json: {
      students_with_levels: students_with_levels_json
    }
  end

  private
  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  def ensure_feature_enabled_for_district!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_levels?
  end
end
