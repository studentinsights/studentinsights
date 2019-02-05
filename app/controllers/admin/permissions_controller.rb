module Admin
  class PermissionsController < ::ApplicationController # does not inherit from administrate
    before_action :ensure_authorized_as_project_lead!

    # queries are optimized for PathsForEducator#navbar_links call,
    # which does authorization checks that require a bunch of
    # associations
    def authorization_json
      navbar_links_map = {}
      sorted_all_educators = Educator.all
        .includes(:school, :homeroom)
        .includes(:section_students)
        .includes({
          sections: {
            course: :school
          }
        })
        .includes(:educator_labels)
        .sort_by do |educator|
          navbar_links = PathsForEducator.new(educator).navbar_links
          navbar_links_map[educator.id] = navbar_links
          navbar_links.keys
        end

      render json: {
        navbar_links_map: navbar_links_map,
        sorted_all_educators: sorted_all_educators.as_json({
          only: [
            :id,
            :full_name,
            :full_name,
            :can_set_districtwide_access,
            :admin,
            :can_view_restricted_notes,
            :districtwide_access
          ],
          include: {
            school: {
              only: [:id, :name]
            }
          }
        })
      }
    end

    private
    def ensure_authorized_as_project_lead!
      raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access
    end
  end
end