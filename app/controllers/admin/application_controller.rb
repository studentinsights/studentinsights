# All Administrate controllers inherit from this `Admin::ApplicationController`,
# making it the ideal place to put authentication logic or other
# filters.
#
# If you want to add pagination or other controller-level concerns,
# you're free to overwrite the RESTful controller actions.
module Admin
  class ApplicationController < Administrate::ApplicationController
    before_action :authenticate_educator!
    before_action :authenticate_admin # administrate hook

    private
    # override, administrate hook
    def authenticate_admin
      redirect_to(not_authorized_path) unless current_educator && current_educator.can_set_districtwide_access?
    end

    # This overrides `current_educator` to enable masquerading as other users.
    # It's mixed in here because Administrate doesn't inherit from `ApplicationController`.
    include MasqueradeHelpers
    helper_method :masquerade
  end
end
