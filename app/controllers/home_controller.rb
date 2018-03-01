class HomeController < ApplicationController
  def home
    notes = EventNote.all
    @serialized_data = 
    {
      educators_index: Educator.to_index,
      event_note_types_index: EventNoteSerializer.event_note_types_index,
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  def home_notes_json
    notes: notes.map {|event_note| EventNoteSerializer.new(event_note).serialize_event_note_with_student }
  end
end
