module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.

    def index
      @_order = Administrate::Order.new(:full_name)
      super
    end

    def resource_params
      # Turn user-entered string into an array:

      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].split(', ')
      params.require(resource_name).permit(*permitted_attributes, grade_level_access: [])
    end

    # See https://administrate-docs.herokuapp.com/customizing_controller_actions
    # for more information
  end
end
