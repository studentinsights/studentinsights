# Used by importers
# See also older survey_reader.rb, this is preferred for new code
class GenericSurveyProcessor
  def initialize(options, &block)
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @process_row_or_nil_block = block

    reset_counters!
  end

  # create ActiveRecord models
  def create!(file_text, record_class)
    rows = dry_run(file_text)
    rows.map do |row|
      record = record_class.new(row)
      if !record.valid?
        @invalid_rows_count += 1
        nil
      else
        record.save!
        @created_rows_count += 1
        record
      end
    end
  end

  # hashes only
  def dry_run(file_text)
    reset_counters!

    row_attrs = []
    create_streaming_csv(file_text).each_with_index do |row, index|
      maybe_row_attrs = @process_row_or_nil_block.call(row) # Map `row` into `attrs`
      next if maybe_row_attrs.nil?
      row_attrs << maybe_row_attrs
      @valid_hashes_count += 1
    end

    row_attrs
  end

  def stats
    {
      valid_hashes_count: @valid_hashes_count,
      invalid_rows_count: @invalid_rows_count,
      invalid_student_ids_count: @invalid_student_ids_count,
      created_rows_count: @created_rows_count
    }
  end

  def reset_counters!
    @valid_hashes_count = 0
    @invalid_rows_count = 0
    @created_rows_count = 0
    @invalid_student_ids_count = 0
  end

  private
  def create_streaming_csv(file_text)
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(file_text)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "GenericSurveyProcessor: #{text}"
  end
end
