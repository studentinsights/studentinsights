class PagesController < ApplicationController

  skip_before_action :authenticate_educator!, only: [:about, :lets_encrypt_endpoint]  # Inherited from ApplicationController

  def no_default_page
  end

  def not_authorized
  end

  def lets_encrypt_endpoint
    render text: ENV['LETS_ENCRYPT_STRING']
  end
end
