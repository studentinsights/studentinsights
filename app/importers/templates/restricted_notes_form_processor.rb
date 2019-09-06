# Takes `restricted_notes` format and processes it to create plain
# objects that can be created as restricted EventNote records.
#
# usage:
# processor = RestrictedNotesFormProcessor.new
# rows = processor.dry_run(file_text)
#
# template: `restricted_notes`
# https://docs.google.com/spreadsheets/d/1XdKDcAbs6DQ4jowAgDfeqDEhwrVLgmd8cMMO3oJAMGg/edit#gid=390525148
class RestrictedNotesFormProcessor

  def initialize(options = {})
    @log = options.fetch(:log, STDOUT)
    @time_now = options.fetch(:time_now, Time.now)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @processor = GenericSurveyProcessor.new(log: @log) do |row|
      process_row_or_nil(row)
    end
  end

  def dry_run(file_text)
    @processor.dry_run(file_text)
  end

  def stats
    {
      importer: @matcher.stats,
      processor: @processor.stats
    }
  end

  private
  # Map `row` into `EventNote` attributes
  def process_row_or_nil(row)
    # student
    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    # educator
    educator = @matcher.find_educator_by_login(row['recorded_by educator_login'])
    return nil if educator.nil?

    # type, default to "something else"
    event_note_type_id = row.fetch('event_note_type_id', '304').to_i

    # timestamp from form, or import time
    timestamp_text = row['Timestamp'] || row['recorded_at timestamp']
    form_timestamp = (timestamp_text.nil?) ? @time_now : @matcher.parse_sheets_est_timestamp(timestamp_text)
    return nil if form_timestamp.nil?

    # text, from whitelist prompts and responses
    restricted_note_text = row['RESTRICTED_NOTE_TEXT']
    return nil if restricted_note_text.nil?

    {
      is_restricted: true,
      text: restricted_note_text,
      student_id: student_id,
      educator_id: educator.id,
      event_note_type_id: event_note_type_id,
      recorded_at: form_timestamp
    }
  end
end
