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

    def authorization
      @all_educators = Educator.all
      
      @districtwide_educators = []
      @can_set_educators = []
      @admin_educators = []
      @restricted_notes_educators = []
    
      @all_educators.each do |educator|
        @districtwide_educators << educator if educator.districtwide_access
        @can_set_educators << educator if educator.can_set_districtwide_access
        @admin_educators << educator if educator.admin
        @restricted_notes_educators << educator if educator.can_view_restricted_notes
      end
      render layout: false
    end

    def resource_params
      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].try(:keys) || []

      params.require("educator").permit(*dashboard.permitted_attributes, grade_level_access: [])
    end

  end
end
