class ImportRecordsController < ApplicationController
  # Authentication by default inherited from ApplicationController.

  before_action :authorize_for_districtwide_access_admin # Extra authentication layer

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def index
    @serialized_data = {
      import_records: ImportRecord.order(created_at: :desc).includes(:import_record_details).take(25).to_json(:include => :import_record_details),
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

end
