class MultifactorController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:send_code]

  def send_code
    raise Exceptions::EducatorNotAuthorized if signed_in?
    render json: { status: 'ok' }, status: 201
  end
end
