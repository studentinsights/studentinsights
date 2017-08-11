module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.

    def index
      @_order = Administrate::Order.new(:full_name)
      super
    end

    def resource_params
      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].split(",")

      params.require("educator").permit(*dashboard.permitted_attributes, grade_level_access: [])
    end

  end
end
