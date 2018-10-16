class TieringController < ApplicationController
  before_action :ensure_feature_enabled_for_district!

  def show_json
    params.require(:school_id)
    params.permit(:time_now)
    school_id = (School.find_by_slug(params[:school_id]) || School.find_by_id(params[:school_id])).id
    time_now = time_now_or_param(params[:time_now])

    tiers = ExperimentalSomervilleHighTiers.new(current_educator)
    students_with_tiering_json = tiers.students_with_tiering_json([school_id], time_now)
    # render json: {
    #   students_with_tiering: students_with_tiering_json
    # }
    render json: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER/tiers.json'))
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
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_tiering?
  end
end
