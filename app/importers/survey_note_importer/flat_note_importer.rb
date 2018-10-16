# Take SurveyReader rows and import them as flat notes (eg, flatten
# the survey content into `text`).
class FlatNoteImporter
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
  end

  # Map `parsed_rows` into `EventNote` attributes, adding in `note_title` to each note
  # and otherwise just flattening the row into flat text.
  def generic_hashes_for_notes(note_title, parsed_rows)
    parsed_rows.map do |row|
      text_from_fields = generic_text_from_fields(row[:source_json])
      text = "#{note_title}\n\n#{text_from_fields}"
      {
        student_id: row[:student_id],
        educator_id: row[:educator_id],
        recorded_at: Time.parse(row[:source_timestamp]),
        is_restricted: false,
        event_note_type_id: 304,
        text: text
      }
    end
  end

  # Search for exact matches and updates/creates those.  Removes
  # any other records within scope (eg, those that have the same "note title"
  # or some other special string.
  #
  # For a survey that has a record mutated, this destroys the old record
  # and creates a new.  Collisions on `note_title` will be dangerous.
  def exact_sync_using_note_title(note_title, hashes_for_notes)
    records_within_scope = records_including_note_title(note_title)
    exact_sync(hashes_for_notes, records_within_scope)
  end

  private
  def exact_sync(hashes_for_notes, records_within_scope)
    syncer = RecordSyncer.new(log: @log)
    hashes_for_notes.each do |hash_for_note|
      maybe_matching_note = EventNote.find_or_initialize_by(hash_for_note)
      syncer.validate_mark_and_sync!(maybe_matching_note)
    end
    syncer.delete_unmarked_records!(records_within_scope)
    syncer
  end

  def records_including_note_title(note_title)
    EventNote
      .where(is_restricted: false)
      .where(event_note_type_id: 304)
      .where('text LIKE ?', "%#{note_title}%")
  end

  def generic_text_from_fields(source_json)
    bits = []
    source_json.each do |key, value|
      bits << "#{key}\n#{value}"
    end
    bits.join("\n\n")
  end
end
