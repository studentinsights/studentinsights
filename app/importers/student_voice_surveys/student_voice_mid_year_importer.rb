# Usage:
# file_text = <<EOD
# ...
# EOD
# form_url = '...'
# educator_id = Educator.find_by_login_name('...').id
# importer = StudentVoiceMidYearImporter.new(educator_id, form_url)
# records = importer.create!(file_text);nil
class StudentVoiceMidYearImporter
  def initialize(educator_id, form_url, options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @strptime_format = options.fetch(:strptime_format, ImportMatcher::GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT)

    @educator_id = educator_id
    @form_url = form_url
    @form_key = ImportedForm::SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR
    @matcher = ImportMatcher.new
    @fuzzy_student_matcher = FuzzyStudentMatcher.new
    reset_counters!
  end

  def create!(file_text)
    rows = dry_run(file_text)
    rows.map {|row| ImportedForm.create!(row) }
  end

  def dry_run(file_text)
    reset_counters!

    row_attrs = []
    create_streaming_csv(file_text).each_with_index do |row, index|
      maybe_row_attrs = process_row_or_nil(row)
      next if maybe_row_attrs.nil?
      row_attrs << maybe_row_attrs
      @valid_hashes_count += 1
    end

    row_attrs
  end

  private
  # Map `row` into `ImportedForm` attributes
  def process_row_or_nil(row)
    # match student by id first, fall back to name
    student_id = exact_or_fuzzy_match_for_student(row['Student ID Number'], row['First and Last Name'])
    if student_id.nil?
      @invalid_student_ids_count += 1
      @invalid_student_ids_list << local_id_text
      nil
    end

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

  def exact_or_fuzzy_match_for_student(local_id_text, full_name_text)
    student_id = @matcher.find_student_id(local_id_text)
    return student_id if student_id.present?

    fuzzy_match = @fuzzy_student_matcher.match_from_full_name(full_name_text)
    return fuzzy_match[:student_id] if fuzzy_match.present?

    nil
  end

  def stats
    {
      valid_hashes_count: @valid_hashes_count,
      invalid_student_name_count: @invalid_student_name_count,
      invalid_student_names_list: @invalid_student_names_list
    }
  end

  def reset_counters!
    @valid_hashes_count = 0
    @invalid_student_name_count = 0
    @invalid_student_names_list = []
  end

  def create_streaming_csv(file_text)
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(file_text)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentVoiceMidYearImporter: #{text}"
  end
end
