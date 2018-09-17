# frozen_string_literal: true

class Educators::SessionsController < Devise::SessionsController
  # # GET /resource/sign_in
  # def new
  #   super
  # end

  # override
  # POST /resource/sign_in
  def create
    devise_parameter_sanitizer.permit(:sign_in, keys: [:login_text])
    super
  end

  # # DELETE /resource/sign_out
  # def destroy
  #   super
  # end
end
