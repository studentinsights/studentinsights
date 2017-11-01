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
      @valid_grades = %w(PK KF SP 1 2 3 4 5 6 7 8 9 10 11 12)
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
