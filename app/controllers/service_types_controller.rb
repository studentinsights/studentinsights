class ServiceTypesController < ApplicationController
  # Used to supply valid service type names to the service upload page.
  # Authentication by default inherited from ApplicationController.

  def control_panel
    @serialized_data = {
      current_educator: current_educator,
      service_types: ServiceType.all
    }
    render 'shared/serialized_data'
  end

  def index
    render json: ServiceType.pluck(:name).sort
  end

end
