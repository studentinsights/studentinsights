class PagesController < ApplicationController

  skip_before_action :authenticate_educator!, only: [:about]  # Inherited from ApplicationController.

  def about
  end

  def no_homeroom
  end

  def lets_encrypt_endpoint
    render text: ENV['LETS_ENCRYPT_STRING']
  end

end
