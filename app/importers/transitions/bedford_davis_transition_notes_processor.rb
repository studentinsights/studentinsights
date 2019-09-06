# DEPRECATED, migrate to `services_checklist` and `teacher_forms` templates'
#
# Process "transition notes" from Bedford, part of
# bootstrapping start-of-school usage within support meetings.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# form_url = '...'
# educator = Educator.find_by_login_name('...')
# importer = BedfordDavisTransitionNotesProcessor.new(educator, form_url)
# records = importer.create!(file_text);nil
class BedfordDavisTransitionNotesProcessor
  def initialize(educator, form_url, options = {})
    Rollbar.warn('deprecation-warning: migrate to `services_checklist` and `teacher_forms` templates')
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)

    @educator = educator
    @form_url = form_url
    @form_key = ImportedForm::BEDFORD_DAVIS_TRANSITION_NOTES_FORM
    @matcher = ImportMatcher.new
    @time_now = options.fetch(:time_now, Time.now)
    @processor = GenericSurveyProcessor.new(log: @log) do |row|
      process_row_or_nil(row)
    end
  end

  def create!(file_text)
    @processor.create!(file_text, ImportedForm)
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
  # Map `row` into `ImportedForm` attributes
  def process_row_or_nil(row)
    # match student by id first, fall back to name
    local_id_text = row['LASID']
    fullname_text = row['Student Name']
    student_id = @matcher.find_student_id_with_exact_or_fuzzy_match(local_id_text, fullname_text)
    return nil if student_id.nil?

    # warn if teacher name doesn't match
    teacher_last_name = row['Teacher'].split(' ').last
    if !@educator.full_name.downcase.include?(teacher_last_name.downcase)
      @log.puts "BedfordDavisTransitionNotesProcessor: provided educator does not match teacher name on sheet: #{teacher_last_name}"
      nil
    end

    # timestamp, just used import time since it's not in the sheet
    form_timestamp = @time_now

    # whitelist prompts and responses
    form_json = row.to_h.slice(*ImportedForm.prompts(@form_key))

    # convert checkboxes to 'yes', or nil
    [
      'LLI',
      'Reading Intervention (w/ specialist)',
      'Math Intervention (w/ consult from SD)'
    ].each do |key|
      form_json[key] = form_json[key].upcase == 'TRUE' ? 'yes' : nil
    end

    {
      student_id: student_id,
      educator_id: @educator.id,
      form_timestamp: form_timestamp,
      form_key: @form_key,
      form_url: @form_url,
      form_json: form_json
    }
  end
end
