# Usage:
# file_text = <<EOD
# ...
# EOD
# importer = StudentVoiceMidYearImporter.new
# rows = importer.process(file_text);nil
# event_notes = rows.map {|row| EventNote.create!(row) };nil
class StudentVoiceMidYearImporter
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @strptime_format = options.fetch(:strptime_format, ImportMatcher::GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT)

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
    # match student by id first, fall back to name
    student_id = exact_or_fuzzy_match_for_student(row)
    if student_id.nil?
      @invalid_student_ids_count += 1
      @invalid_student_ids_list << local_id_text
      nil
    end

    # timestamp
    recorded_at = DateTime.strptime(row['Timestamp'], @strptime_format)

    # flatten the rest of the fields
    prompts = [
      'What was the high point for you in school this year so far?',
      "What's something that most teachers don't know about me, but they should?",
      'I am proud that I...',
      'My best qualities are...',
      'My activities and interests outside of school are...',
      'I get nervous or stressed in school when...',
      'I learn best when my teachers...'
    ]

    # insight_prompts = {
    #   :proud,
    #   :best_qualities,
    #   :activities_and_interests,
    #   :nervous_or_stressed,
    #   :learn_best
    # }
    {
      student_id: student_id,
      educator_id: educator_id,
      recorded_at: recorded_at,
      is_restricted: false,
      event_note_type_id: 304,
      text: flattened_note_text(row)
    }
  end

  def exact_or_fuzzy_match_for_student(row)
    local_id_text = row['Student ID Number']
    student_id = @matcher.find_student_id(local_id_text)
    return student_id if student_id.present?
      
    fuzzy_match = @fuzzy_student_matcher.match_from_full_name(row['First and Last Name'])
    return fuzzy_match[:student_id] if fuzzy_match.present?

    nil    
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
    @log.puts "StudentVoiceMidYearImporter: #{text}"
  end

  def wat
    mid_year_prompts = [
      'What was the high point for you in school this year so far?',
      "What's something that most teachers don't know about me, but they should?",
      'I am proud that I...',
      'My best qualities are...',
      'My activities and interests outside of school are...',
      'I get nervous or stressed in school when...',
      'I learn best when my teachers...'
    ]

    # Timestamp,Email Address, What is your local student ID number?
    # "What's your local ID number?",
    #"What's your first and last name?",
    self_reflection_prompts = [
      'What classes are you doing well in?',
      'Why are you doing well in those classes?',
      'What courses are you struggling in?',
      'Why are you struggling in those courses?',
      "In the classes that you are struggling in, how can your teachers support you so that your grades, experience, work load, etc, improve?",
      "When you are struggling, who do you go to for support, encouragement, advice, etc?",
      "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
      "What other information is important for your teachers to know so that we can support you and your learning? (For example, tutor, mentor, before school HW help, study group, etc)"
    ]
  end
end
