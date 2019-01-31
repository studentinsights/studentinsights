module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.
    before_action :default_params

    def default_params
      params[:order] ||= "full_name"
      params[:direction] ||= "desc"
    end

    def edit
      @valid_grades = GradeLevels::ORDERED_GRADE_LEVELS
      super
    end

    def update
      super
      requested_resource.save_student_searchbar_json
    end

    def resource_params
      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].try(:keys) || []

      params.require("educator").permit(*dashboard.permitted_attributes, grade_level_access: [])
    end

  end
end
