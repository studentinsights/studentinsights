class UiController < ApplicationController

  # This is a generic route for the server to respond and
  # send back the minimal data for client-side routing to then
  # run and take over rendering, fetching what data it needs, etc.
  def ui
    current_educator_json = current_educator.as_json({
      only: [:id, :email, :full_name, :staff_type, :admin],
      include: {
        school: {
          only: [:id, :name, :school_type]
        },
        homeroom: {
          only: [:id, :name, :grade]
        }
      }
    })
    @serialized_data = {
      current_educator: current_educator_json
    }
    render 'shared/serialized_data'
  end
end
