# typed: true
class Remove51aEventNoteType < ActiveRecord::Migration[4.2]
  def change
    # This type is being removed, and this will be capture as a 'service' instead.
    # See also EventNoteType#seed_somerville_event_note_types
    begin
      EventNoteType.find(303).destroy!
    rescue ActiveRecord::RecordNotFound
    end
  end
end
