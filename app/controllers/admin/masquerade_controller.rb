module Admin
  class MasqueradeController < ::ApplicationController # does not inherit from administrate
    before_action :ensure_can_masquerade!

    # POST to masquerade as another user
    def become
      params.require(:masquerading_educator_id)
      masquerade.set_educator_id!(params[:masquerading_educator_id].to_i)
      redirect_to root_url
    end

    # POST to clear out any masquerading
    def clear
      masquerade.clear!
      redirect_to root_url
    end

    private
    def ensure_can_masquerade!
      raise Exceptions::EducatorNotAuthorized unless masquerade.can_set?
    end
  end
end
