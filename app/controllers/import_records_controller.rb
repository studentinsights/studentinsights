class ImportRecordsController < ApplicationController
  # Authentication by default inherited from ApplicationController.

  before_action :authorize_for_districtwide_access_admin # Extra authentication layer

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def index
    @import_records = ImportRecord.order(created_at: :desc).take(25)
    @queued_jobs = Delayed::Job.all
  end

end
