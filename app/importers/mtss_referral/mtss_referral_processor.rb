# typed: false
# Usage:
# file_text = <<EOD
# ...
# EOD
# importer = MtssReferralProcessor.new
# rows = importer.process(file_text);nil
# event_notes = rows.map {|row| EventNote.create!(row) };nil
class MtssReferralProcessor
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)

    @matcher = ImportMatcher.new
    @fuzzy_student_matcher = FuzzyStudentMatcher.new
    reset_counters!
  end

  def process(file_text)
    reset_counters!

    event_note_hashes = []
    create_streaming_csv(file_text).each_with_index do |row, index|
      maybe_row_attrs = process_row_or_nil(row)
      next if maybe_row_attrs.nil?
      event_note_hashes << maybe_row_attrs
      @valid_hashes_count += 1
    end

    event_note_hashes
  end

  private
  def create_streaming_csv(file_text)
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(file_text)
  end

  # Map `row` into `EventNote` attributes, adding in `note_title` to each note
  # and otherwise just flattening the row into flat text.
  def process_row_or_nil(row)
    # match student
    fuzzy_match = @fuzzy_student_matcher.match_from_full_name(row['Student Name (eg, Sofia Alonso Martinez)'])
    if fuzzy_match.nil?
      @invalid_student_name_count += 1
      @invalid_student_names_list << student_name
      return nil
    end
    student_id = fuzzy_match[:student_id]

    # match educator
    educator_id = @matcher.find_educator_id(row['Email Address'])

    # timestamp
    recorded_at = @matcher.parse_sheets_est_timestamp(row['Timestamp'])

    # flatten the rest of the fields
    {
      student_id: student_id,
      educator_id: educator_id,
      recorded_at: recorded_at,
      is_restricted: false,
      event_note_type_id: 304,
      text: flattened_note_text(row)
    }
  end

  def flattened_note_text(row)
    note_title = 'MTSS Referral Form'
    text_from_fields = flat_text_from_fields(row, [
      'Timestamp',
      'Email Address',
      'Student Name (eg, Sofia Alonso Martinez)',
      'Referring Staff Member'
    ])
    "#{note_title}\n\n#{text_from_fields}"
  end

  def flat_text_from_fields(raw_row, exclude_fields)
    bits = []
    row = raw_row.to_h
    (row.keys - exclude_fields).each do |key|
      next if row[key].nil? || row[key].empty? || row[key] == ''
      bits << "#{key}\n#{row[key]}"
    end
    bits.join("\n\n")
  end

  def stats
    {
      valid_hashes_count: @valid_hashes_count,
      invalid_row_columns_count: @invalid_row_columns_count,
      invalid_student_name_count: @invalid_student_name_count,
      invalid_student_names_list: @invalid_student_names_list
    }
  end

  def reset_counters!
    @valid_hashes_count = 0
    @invalid_row_columns_count = 0
    @invalid_student_name_count = 0
    @invalid_student_names_list = []
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MtssReferralProcessor: #{text}"
  end
end
