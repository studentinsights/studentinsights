class ServiceTypesController < ApplicationController
  # Used to supply valid service type names to the service upload page.
  # Authentication by default inherited from ApplicationController.

  def index
    render json: ServiceType.pluck(:name).sort
  end

end
