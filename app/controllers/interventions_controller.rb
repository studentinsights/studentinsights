class InterventionsController < ApplicationController

  before_action :authenticate_educator!

  def create
    intervention = Intervention.new(intervention_params)
    intervention.start_date = Time.zone.now.to_date
    if intervention_params[:end_date].present?
      intervention.end_date = Date.parse(intervention_params[:end_date])
    end
    intervention.save

    # TODO(kr) factor out to serializer
    render json: {
      id: intervention.id,
      name: intervention.name,
      comment: intervention.comment,
      goal: intervention.goal,
      start_date: intervention.start_date.strftime('%B %e, %Y'),
      end_date: intervention.end_date.try(:strftime, '%B %e, %Y'),
      educator_email: intervention.educator.try(:email)
    }
  end

  def intervention_params
    params.require(:intervention).permit(
      :student_id,
      :educator_id,
      :intervention_type_id,
      :comment,
      :start_date,
      :end_date,
      :goal
    )
  end

end
