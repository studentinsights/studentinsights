# typed: true
class BedfordNoteTypes < ActiveRecord::Migration[5.2]
  def change
    return unless PerDistrict.new.district_key == PerDistrict::BEDFORD

    # Effectively remove other notes types for Bedford, convert older
    # types to "Something else" so it's not confusing for folks.
    #
    # Log the ids changed.
    notes_with_other_types = EventNote.where.not(event_note_type_id: [300, 302, 304])
    puts "Migrating event_note_type_id for #{notes_with_other_types.size} EventNote ids: [#{notes_with_other_types.join(',')}]"
    notes_with_other_types.each do |note|
      note.update!(event_note_type_id: 304)
    end
  end
end
