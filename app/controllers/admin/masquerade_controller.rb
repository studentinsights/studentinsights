module Admin
  class MasqueradeController < ::ApplicationController # does not inherit from administrate
    before_action :ensure_can_masquerade!

    # POST to masquerade as another user
    def become
      params.require(:masquerading_educator_id)
      return unless masquerade.can_set?
      masquerade.set_educator_id!(params[:masquerading_educator_id].to_i)
      redirect_to root_url
    end

    # POST to clear out any masquerading
    def clear
      return unless masquerade.can_set?
      masquerade.clear!
      redirect_to root_url
    end

    private
    def ensure_can_masquerade!
      raise Exceptions::EducatorNotAuthorized unless masquerade.can_set?
    end

    def masquerade
      @masquerade ||= Masquerade.new(self)
    end
  end
end
