# Takes a CSV processes each row to join keys with Insights (eg, from say a survey).
#
# The shape is:
#  1) `source_key` describes what this is
#  2) each row references a student and and educator
#  3) the importer might skip some rows
#  4) there are some fields for importing (eg, LASID)
#  5) other fields are stored as a map of field>value in `source_json`
#
# The semantics for data flow here are:
#  1) rows aren't guaranteed to be unique in the source data
#  2) in-place edits are unlikely, but will update records in-place
class SurveyReader
  # Timestamps have differnet formats if you download a Google Form as a CSV
  # versus if you export that same form to Sheets (and then download that).
  GOOGLE_FORM_CSV_TIMESTAMP_FORMAT = '%Y/%m/%d %l:%M:%S %p %Z'
  GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT = '%m/%d/%Y %k:%M:%S'

  def initialize(file_text, options = {})
    @file_text = file_text
    @source_key = options[:source_key]
    @config = options[:config]
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @strptime_format = options.fetch(:strptime_format, GOOGLE_FORM_CSV_TIMESTAMP_FORMAT)
    reset_counters!
  end

  def parse_rows
    reset_counters!

    parsed_rows = []
    create_streaming_csv.each_with_index do |row, index|
      maybe_row = maybe_row(row, index)
      next if maybe_row.nil?

      parsed_rows << maybe_row
      @valid_rows_count +=1
    end

    {
      stats: stats,
      parsed_rows: parsed_rows
    }
  end

  private
  def maybe_row(raw_row, source_index)
    config = @config
    row = raw_row.to_h

    # student?
    student_local_id = row[config[:student_local_id]].try(:strip)
    student_id = Student.find_by_local_id(student_local_id).try(:id) unless student_local_id.nil?
    if student_id.nil?
      @invalid_rows_count += 1
      @invalid_student_local_ids = (@invalid_student_local_ids + [student_local_id]).uniq
      return nil
    end

    # educator?
    educator_email = row[config[:educator_email]].try(:strip)
    educator_id = Educator.find_by_email(educator_email).try(:id) unless student_local_id.nil?
    if educator_id.nil?
      @invalid_rows_count += 1
      @invalid_educator_emails = (@invalid_educator_emails + [educator_email]).uniq
      return nil
    end

    # parse timestamp into DateTime
    source_timestamp = DateTime.strptime(row[config[:timestamp]], config[:strptime_format])

    # grab other fields, filtering out special ones and `ignore_keys`
    special_keys = [config[:student_local_id], config[:educator_email], config[:timestamp]]
    keep_keys = row.keys - special_keys - config[:ignore_keys]
    source_json = row.slice(*keep_keys)

    {
      source_key: @source_key,
      source_index: source_index,
      student_id: student_id,
      educator_id: educator_id,
      source_timestamp: source_timestamp,
      source_json: source_json
    }
  end

  def create_streaming_csv
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(@file_text)
  end

  def reset_counters!
    @valid_rows_count = 0
    @invalid_rows_count = 0
    @invalid_student_local_ids = []
    @invalid_educator_emails = []
  end

  def stats
    {
      valid_rows_count: @valid_rows_count,
      invalid_rows_count: @invalid_rows_count,
      invalid_student_local_ids: @invalid_student_local_ids,
      invalid_educator_emails: @invalid_educator_emails
    }
  end
end
