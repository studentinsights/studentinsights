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
      EducatorSearchbar.update_student_searchbar_json!(requested_resource)
    end

    def authorization
      educators_with_includes = Educator.all.includes(:educator_labels, :school, :sections, {homeroom: :school})
      @sensitive_educators = sorted_sensitive_educators(educators_with_includes)
      @sorted_educators, @navbar_links_map = sort_list_with_navbar_links(educators_with_includes)
      nil
    end

    def sort_list_with_navbar_links(educators)
      navbar_links_map = {}
      sorted_educators = educators.sort_by do |educator|
        navbar_links = PathsForEducator.new(educator).navbar_links
        navbar_links_map[educator.id] = navbar_links
        [
          educator.active? ? 0 : 1,
          -1 * navbar_links.size,
          navbar_links.keys
        ]
      end
      [sorted_educators, navbar_links_map]
    end

    def sorted_sensitive_educators(educators)
      filtered = educators.select do |educator|
        (
          educator.active? ||
          educator.can_set_districtwide_access ||
          educator.can_view_restricted_notes ||
          educator.districtwide_access ||
          educator.admin
        )
      end

      filtered.sort_by do |educator|
        [
          educator.active? ? 0 : 1,
          educator.can_set_districtwide_access ? 0 : 1,
          educator.can_view_restricted_notes ? 0 : 1,
          educator.districtwide_access ? 0 : 1,
          educator.admin ? 0 : 1
        ]
      end
    end

    def resource_params
      params["educator"]["grade_level_access"] = params["educator"]["grade_level_access"].try(:keys) || []

      params.require("educator").permit(*dashboard.permitted_attributes, grade_level_access: [])
    end

  end
end
