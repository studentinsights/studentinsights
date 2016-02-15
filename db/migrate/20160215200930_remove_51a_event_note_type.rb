class Remove51aEventNoteType < ActiveRecord::Migration
  def change
    # This type is being removed, and this will be capture as a 'service' instead.
    # See also EventNoteType#seed_somerville_event_note_types
    EventNoteType.find(303).destroy!
  end
end
