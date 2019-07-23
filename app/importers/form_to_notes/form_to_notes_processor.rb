# usage:
# processor = FormToNotesProcessor.new(source_json: '...')
# rows = processor.dry_run(file_text)
class FormToNotesProcessor

  def initialize(options = {})
    @log = options.fetch(:log, STDOUT)
    @source_json = options.fetch(:source_json, nil)
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
    event_note_type_id = row.fetch('event_note_type_id', 304)

    # timestamp from form, or import time
    timestamp_text = row['Timestamp']
    form_timestamp = (timestamp_text.nil?) ? @time_now : @matcher.parse_sheets_est_timestamp(timestamp_text)
    return nil if form_timestamp.nil?

    # text, from whitelist prompts and responses
    prompt_keys = row.to_h.keys.select do |column_text|
      column_text.starts_with?('Q: ') && !column_text.downcase.include?('restricted')
    end
    text = prompt_keys.map {|key| [key, row[key]].join("\n") }.join("\n\n")

    {
      student_id: student_id,
      educator_id: educator.id,
      is_restricted: false,
      text: text,
      event_note_type_id: event_note_type_id,
      recorded_at: form_timestamp
        # source_json: @source_json
    }
  end
end
