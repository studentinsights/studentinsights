class MoreEventNoteTypes < ActiveRecord::Migration[5.2]
  def change
    EventNoteType.find_or_create_by!({ id: 501, name: "CAT Meeting" })
    EventNoteType.find_or_create_by!({ id: 502, name: "504 Meeting" })
    EventNoteType.find_or_create_by!({ id: 503, name: "SPED Meeting" })
  end
end
