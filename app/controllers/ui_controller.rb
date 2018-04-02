class UiController < ApplicationController

  # This is a generic route for the server to respond and
  # send back the minimal data for client-side routing to then
  # run and take over rendering, fetching what data it needs, etc.
  def ui
    in_experience_team = PerDistrict.new.in_shs_experience_team?(current_educator)
    current_educator_json = current_educator.as_json({
      only: [:id, :email]
    }).merge({
      in_experience_team: in_experience_team
    })
    @serialized_data = {
      current_educator: current_educator_json
    }
    render 'shared/serialized_data'
  end
end
