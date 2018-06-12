class TieringController < ApplicationController
  before_action :ensure_feature_enabled_for_district!
  before_action :ensure_educator_authorization!

  def show_json
    time_now = time_now_or_param(params[:time_now])
    school_id = params[:school_id]

    tiers = SomervilleHighTiers.new(current_educator)
    students_with_tiering_json = tiers.students_with_tiering_json([school_id], time_now)
    render json: {
      students_with_tiering: students_with_tiering_json
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
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_tiering?
  end

  def ensure_educator_authorization!
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
  end
end
