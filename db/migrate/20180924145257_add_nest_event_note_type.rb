class AddNestEventNoteType < ActiveRecord::Migration[5.2]
  def change
    EventNoteType.create!({ id: 307, name: 'NEST' })
  end
end
