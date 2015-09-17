class InterventionsController < ApplicationController

  before_action :authenticate_educator!

  def create
    @intervention = Intervention.new(intervention_params)
    @intervention.start_date = Time.zone.now.to_date
    @intervention.end_date = Date.parse(intervention_params[:end_date]) if intervention_params[:end_date].present?
    @intervention.save
    redirect_to student_path(@intervention.student) + "#interventions-row"
  end

  def intervention_params
    params.require(:intervention).permit(
      :student_id,
      :educator_id,
      :intervention_type_id,
      :comment,
      :start_date,
      :end_date
    )
  end
end
