class LoginActivitiesController < ApplicationController
  before_action :ensure_authorized!

  def index_json
    params.require(:created_at_or_before)
    params.require(:created_after)

    created_at_or_before = Time.at(params[:created_at_or_before].to_i)
    created_after = Time.at(params[:created_after].to_i)

    return render json: login_activity_json(
      created_at_or_before: created_at_or_before,
      created_after: created_after
    )
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
  end

  def login_activity_json(created_at_or_before:, created_after:)
    LoginActivity.where('created_at > ?', created_after)
                 .where('created_at <= ?', created_at_or_before)
                 .as_json({ only: [ :identity, :success, :created_at, :failure_reason ] })
  end

end
