class StatForBedford < ActiveRecord::Migration[5.2]
  def change
    if EventNoteType.find_by_id(500).nil?
      EventNoteType.create!(id: 500, name: 'STAT')
    end
  end
end
