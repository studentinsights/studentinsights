class PagesController < ApplicationController

  skip_before_action :authenticate_educator!, only: [:about]

  def about
  end

end
