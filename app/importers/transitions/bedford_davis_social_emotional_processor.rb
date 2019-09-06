# DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`
#
# Process "social emotional notes" from Bedford, part of
# bootstrapping start-of-school usage within support meetings.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# default_educator = Educator.find_by_login_name('...')
# processor = BedfordDavisSocialEmotionalProcessor.new(default_educator)
# rows = processor.dry_run(file_text);nil
class BedfordDavisSocialEmotionalProcessor
  def initialize(default_educator, options = {})
    Rollbar.warn('deprecation-warning, see RestrictedNotesProcessor and migrate to `restricted_notes`')
    @default_educator = default_educator

    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = ImportMatcher.new
    @time_now = options.fetch(:time_now, Time.now)
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
    # match student by id first, fall back to name
    local_id_text = row['LASID']
    fullname_text = row['Student Name']
    student_id = @matcher.find_student_id_with_exact_or_fuzzy_match(local_id_text, fullname_text)
    return nil if student_id.nil?

    # find counselor if we can, if not fall back to default_educator
    educator_id = try_counselor_field_or_fallback(row)

    # timestamp, just used import time since it's not in the sheet
    form_timestamp = @time_now

    # default
    event_note_type_id = 304

    # form text from checkboxes and note
    text_lines = read_text_lines(row)
    return nil if text_lines.size == 0

    {
      student_id: student_id,
      educator_id: educator_id,
      is_restricted: true,
      text: text_lines.join("\n"),
      event_note_type_id: event_note_type_id,
      recorded_at: form_timestamp
    }
  end

  def try_counselor_field_or_fallback(row)
    counselor_field = row.fetch('Counselor ', nil) # note the trailing space

    if counselor_field.present?
      counselor_last_name = counselor_field.split(' ').last # note the trailing space
      matching_educator = @matcher.find_educator_by_last_name(counselor_last_name)
      return matching_educator.id if matching_educator.present?
    end

    @default_educator.id
  end

  def read_text_lines(row)
    # include services that are checked
    checked_services = [
      'Soc.Emo. Check in w/ counselor', # note spacing
      'Soc. Emo. Small group',
      'Soc. Emo. individual counseling',
      'Formal Behavior Plan'
    ].select do |key|
      row.to_h[key].upcase == 'TRUE'
    end

    text_lines = []
    if checked_services.size > 0
      text_lines += ['Social emotional services during 2018-2019']
      text_lines += checked_services.map {|service_text| "- #{service_text}"}
    end

    restricted_note_text = row['Notes from the counselor']
    if restricted_note_text.present?
      text_lines += ((text_lines.size > 0) ? [''] : []) + [restricted_note_text]
    end

    text_lines
  end
end
