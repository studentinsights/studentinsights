class UiController < ApplicationController

  # This is a generic route for the server to respond and
  # send back the minimal data for client-side routing to then
  # run and take over rendering, fetching what data it needs, etc.
  def ui
    @serialized_data = {
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end
end
