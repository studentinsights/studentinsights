# frozen_string_literal: true

class Educators::SessionsController < Devise::SessionsController
  # GET /educator/sign_in
  def new
    super
    @district_url = 'http://www.somerville.k12.ma.us'
    @district_logo_src = '/somerville-public-schools.jpg'
    @district_logo_alt = 'Somerville public schools logo'
  end

  # changes here impact Rack::Attack setup
  # POST /educator/sign_in
  # def create
  #   super
  # end

  # # DELETE /educator/sign_out
  # def destroy
  #   super
  # end
end
