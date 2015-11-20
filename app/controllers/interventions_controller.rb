class InterventionsController < ApplicationController
  include SerializeInterventionHelper
  
  before_action :authenticate_educator!

  def create
    intervention = Intervention.new(intervention_params)
    intervention.start_date = Time.zone.now.to_date
    if intervention_params[:end_date].present?
      intervention.end_date = Date.parse(intervention_params[:end_date])
    end
    intervention.save

    render json: serialize_intervention(intervention)
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
