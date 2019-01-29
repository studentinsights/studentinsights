# Usage:
# file_text = <<EOD
# ...
# EOD
# form_url = '...'
# educator_id = Educator.find_by_login_name('...').id
# importer = Q2SelfReflectionImporter.new(educator_id, form_url)
# records = importer.create!(file_text);nil
class Q2SelfReflectionImporter
  def initialize(educator_id, form_url, options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @strptime_format = options.fetch(:strptime_format, ImportMatcher::GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT)

    @educator_id = educator_id
    @form_url = form_url
    @form_key = ImportedForm::SHS_Q2_SELF_REFLECTION
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

  private
  # Map `row` into `ImportedForm` attributes
  def process_row_or_nil(row)
    # match student by id first, fall back to name
    local_id_text = row["What's your local ID number?"]
    student_id = @processor.exact_or_fuzzy_match_for_student(local_id_text, row["What's your first and last name?"])
    return nil if student_id.nil?

    # timestamp
    form_timestamp = DateTime.strptime(row['Timestamp'], @strptime_format)

    # whitelist prompts and responses
    form_json = row.to_h.slice(*ImportedForm.prompts(@form_key))

    {
      student_id: student_id,
      educator_id: @educator_id,
      form_timestamp: form_timestamp,
      form_key: @form_key,
      form_url: @form_url,
      form_json: form_json
    }
  end
end
