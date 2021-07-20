require 'csv'

# This implements:
#   the Transformer interface {transform}
#   our ad-hoc CSV data interface {each_with_index}
class StreamingCsvTransformer
  NIL_CODE = '\N'

  # Sugar for the common "just give me parsed rows" use case
  # Note that this uses different options that the default.
  def self.from_text(log, file_text, options = {})
    StreamingCsvTransformer.new(log, {
      csv_options: { header_converters: nil }
    }.merge(options)).transform(file_text)
  end

  def initialize(log, options = {})
    @log = log
    @headers = options.fetch(:headers, true)
    @csv_options = options.fetch(:csv_options, {})
    reset_counters!
  end

  # Performs whole-file transformations first
  # This method returns itself, satisfying the {each_with_index} interface for
  # iterating over CSV rows.
  def transform(csv_string)
    @csv_string = ParseableCsvString.new(@log).from_string(csv_string)
    self
  end

  # Stream each line of the CSV and parse it.
  # This includes three different types of transformations to replicate
  # the behavior of CsvTransformer for now.  These could be pushed out to
  # callers in the future.  These are: nil_converter for each field, discarding rows with
  # dirty_data? and parsing particular field names into Ruby dates.
  def each_with_index(&block)
    reset_counters!

    csv_options = {
      headers: @headers,
      header_converters: :symbol,
      converters: lambda { |h| nil_converter(h) }
    }.merge(@csv_options)
    CSV.new(@csv_string, csv_options).each.with_index do |row, index|
      cleaner = CsvRowCleaner.new(row)
      if cleaner.dirty_data?
        @skipped_dirty_rows_count = @skipped_dirty_rows_count + 1
        next
      end

      cleaner.transform_row
      block.call(row, index)
      @processed_rows_count = @processed_rows_count + 1
    end

    @log.puts("StreamingCsvTransformer#stats: #{stats}")
    nil
  end

  private
  def stats
    {
      skipped_dirty_rows_count: @skipped_dirty_rows_count,
      processed_rows_count: @processed_rows_count
    }
  end

  def reset_counters!
    @skipped_dirty_rows_count = 0
    @processed_rows_count = 0
    nil
  end

  def nil_converter(value)
    value == NIL_CODE ? nil : value
  end
end
