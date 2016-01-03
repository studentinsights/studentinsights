class InterventionsController < ApplicationController
  include SerializeDataHelper

  def create
    intervention = Intervention.new(intervention_params)
    intervention.start_date = Time.zone.now.to_date
    if intervention_params[:end_date].present?
      intervention.end_date = Date.parse(intervention_params[:end_date])
    end

    if intervention.save
      render json: serialize_intervention(intervention)
    else
      render json: { errors: intervention.errors.full_messages }, status: 422
    end
  end

  def intervention_params
    params.require(:intervention).permit(
      :student_id,
      :educator_id,
      :intervention_type_id,
      :custom_intervention_name,
      :comment,
      :start_date,
      :end_date,
      :goal
    )
  end

end
