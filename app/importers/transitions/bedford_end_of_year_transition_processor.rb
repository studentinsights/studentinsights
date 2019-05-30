# Usage:
# file_text = <<EOD
# ...
# EOD
# form_url = '...'
# educator = Educator.find_by_login_name('...')
# homeroom = educator.homeroom
# importer = BedfordEndOfYearTransitionProcessor.new(educator, homeroom, form_url)
# records = importer.create!(file_text);nil
class BedfordEndOfYearTransitionProcessor
  def initialize(educator, homeroom, form_url, options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)

    @educator = educator
    @homeroom = homeroom
    @form_url = form_url
    @form_key = ImportedForm::BEDFORD_END_OF_YEAR_TRANSITION_FORM
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
      importer: @matcher.stats,
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

    # warn if homeroom doesn't match
    student = Student.find(student_id)
    if student.homeroom.id != @homeroom.id
      puts "  homeroom does not match for student_id: #{student_id}"
      return nil
    end

    # warn if teacher name doesn't match
    teacher_last_name = row['Teacher'].split(' ').last
    if !@educator.full_name.downcase.include?(teacher_last_name.downcase)
      puts "  provided educator does not match teacher name on sheet: #{teacher_last_name}"
      nil
    end

    # timestamp, just used import time since it's not in the sheet
    form_timestamp = @time_now

    # whitelist prompts and responses
    form_json = row.to_h.slice(*ImportedForm.prompts(@form_key))

    # convert checkboxes to boolean
    [
      'LLI',
      'Reading Intervention (w/ specialist)',
      'Math Intervention (w/ consult from SD)'
    ].each do |key|
      form_json[key] = form_json[key].upcase === 'TRUE' ? true : false
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
