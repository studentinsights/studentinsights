class MyNotesController < ApplicationController
  DEFAULT_BATCH_SIZE = 30

  def my_notes_feed_json
    batch_size = params["batch_size"].to_i
    serialized_data = my_notes_feed_data(batch_size)
    render json: serialized_data
  end

  def my_notes_feed
    @serialized_data = my_notes_feed_data(DEFAULT_BATCH_SIZE)
    render 'shared/serialized_data'
  end

  private
  def my_notes_feed_data(batch_size)
    total_notes_for_educator = EventNote.where(educator_id: current_educator.id).count
    notes = EventNote.includes(:student)
            .where(educator_id: current_educator.id)
            .where(is_restricted: false)
            .order(recorded_at: :desc)
            .limit(batch_size)
    {
      educators_index: Educator.to_index,
      event_note_types_index: EventNoteSerializer.event_note_types_index,
      current_educator: current_educator,
      notes: notes.map {|event_note| EventNoteSerializer.new(event_note).serialize_event_note_with_student },
      total_notes_count: total_notes_for_educator
    }
  end
end
