class PagesController < ApplicationController

  skip_before_action :authenticate_educator!, only: [:about]  # Inherited from ApplicationController

  def no_default_page
  end

  def not_authorized
  end
end
