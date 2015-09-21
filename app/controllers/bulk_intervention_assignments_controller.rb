class BulkInterventionAssignmentsController < ApplicationController

  def new
    @bulk_intervention_assignment = BulkInterventionAssignment.new
  end

  def create
    assignment = BulkInterventionAssignment.new(params['bulk_intervention_assignment'])
    @interventions = assignment.interventions
    respond_to :js
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound, ArgumentError => e
    @message = e.message
    @interventions = []
    respond_to :js
  end

end
