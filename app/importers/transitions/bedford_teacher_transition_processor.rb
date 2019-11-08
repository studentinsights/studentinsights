# DEPRECATED, see `FormToNotesProcessor` and `teacher_forms` format.
class BedfordTeacherTransitionProcessor
  def initialize(educator, options = {})
    Rollbar.warn('deprecation-warning, see `FormToNotesProcessor` and `teacher_forms` format')
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::FakeLog.new : STDOUT)

    @educator = educator
    @matcher = ImportMatcher.new
    @time_now = options.fetch(:time_now, Time.now)
    @processor = GenericSurveyProcessor.new(log: @log) do |row|
      process_row_or_nil(row)
    end
  end

  def create!(file_text)
    raise 'Not implemented, use #dry_run manually instead.'
  end

  def dry_run(file_text)
    @processor.dry_run(file_text)
  end

  def stats
    {
      matcher: @matcher.stats,
      processor: @processor.stats
    }
  end

  private
  # Map `row` into `EventNote` attributes
  def process_row_or_nil(row)
    # match student by id
    local_id_text = row['LASID']
    student_id = @matcher.find_student_id(local_id_text)
    return nil if student_id.nil?

    # timestamp, just used import time since it's not in the sheet
    recorded_at = @time_now

    prompt_text = 'what helped you connect with this student and/or can you comment on one success the student had this year?'
    response_text = row[prompt_text]
    text = response_text

    # event_note
    {
      student_id: student_id,
      educator_id: @educator.id,
      recorded_at: recorded_at,
      text: text,
      event_note_type_id: 304, # something else
      is_restricted: false
    }
  end
end
