module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.

    def index
      @_order = Administrate::Order.new(:full_name)
      super
    end

    def edit
      @valid_grades = %w(PK KF SP 1 2 3 4 5 6 7 8 9 10 11 12)
      super
    end

    def update
      super
      PrecomputeSearchbarJson.new.for(requested_resource)
    end

    def resource_params
      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].try(:keys) || []

      params.require("educator").permit(*dashboard.permitted_attributes, grade_level_access: [])
    end

  end
end
