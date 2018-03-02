class HomeController < ApplicationController
  def home
    @serialized_data = {
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  def home_notes_json
    notes = EventNote.all
    render json: {
      notes: notes.map {|event_note| EventNoteSerializer.new(event_note).serialize_event_note_with_student }
    }
  end
end
