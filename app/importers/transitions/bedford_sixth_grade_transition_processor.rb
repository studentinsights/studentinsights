# Student voice survey for Bedford students transitioning
# schools from 5th grade to 6th grade.
# See `bedford_sixth_grade_transition_notes_importer_sheet_id` in env.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# form_url = '...'
# educator_id = Educator.find_by_login_name('...').id
# importer = BedfordSixthGradeTransitionProcessor.new(educator_id, form_url)
# hashes = importer.dry_run(file_text);nil
class BedfordSixthGradeTransitionProcessor
  def initialize(educator_id, form_url, options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)

    @educator_id = educator_id
    @form_url = form_url
    @form_key = ImportedForm::BEDFORD_SIXTH_GRADE_TRANSITION_FORM
    @matcher = ImportMatcher.new
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
    # match student by id
    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    # timestamp
    form_timestamp = @matcher.parse_sheets_est_timestamp(row['Timestamp'])
    return nil if form_timestamp.nil?

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
