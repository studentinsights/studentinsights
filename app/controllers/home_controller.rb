class HomeController < ApplicationController
  def home
    @serialized_data = {
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  def notes_json
    limit = 20
    event_notes = authorized { EventNote.all.order(updated_at: :desc) }
    recent_event_notes = event_notes.first(limit)
    event_notes_json = recent_event_notes.map do |event_note|
      event_note.as_json({
        :only => [:id, :updated_at, :event_note_type_id, :text],
        :include => {
          :educator => {:only => [:id, :full_name, :email]},
          :student => {
            :only => [:id, :email, :first_name, :last_name, :grade, :house],
            :include => {
              :homeroom => {
                :only => [:id, :name],
                :include => {
                  :educator => {:only => [:id, :full_name, :email]}
                }
              }
            }
          }
        }
      })
    end
    render json: {
      event_notes: event_notes_json
    }
  end
end
