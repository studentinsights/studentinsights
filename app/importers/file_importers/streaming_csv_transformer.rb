require 'csv'

# This implements:
#   the Transformer interface {transform, pre_cleanup_csv_size}
#   our ad-hoc CSV data interface {each_with_index, size}
class StreamingCsvTransformer
  NIL_CODE = '\N'

  def initialize(log, options = {})
    @log = log
    @headers = options.key?(:headers) ? options[:headers] : true
    @total_rows_count = nil
    @processed_rows_count = nil
  end

  # Performs whole-file transformations first
  # This method returns itself, satisfying the {each_with_index, size} inteface for
  # iterating over CSV rows.
  def transform(csv_string)
    @csv_string = ParseableCsvString.new(@log).from_string(csv_string)
    self
  end

  # This is only valid after data is read with #each_with_index
  def pre_cleanup_csv_size
    @total_rows_count
  end

  # Stream each line of the CSV and parse it.
  # This includes three different types of transformations to replicate
  # the behavior of CsvTransformer for now.  These could be pushed out to
  # callers in the future.  These are: nil_converter for each field, discarding rows with
  # dirty_data? and parsing particular field names into Ruby dates.
  def each_with_index(&block)
    @total_rows_count = 0
    @processed_rows_count = 0

    CSV.new(@csv_string, {
      headers: @headers,
      header_converters: :symbol,
      encoding: 'binary:UTF-8',
      converters: lambda { |h| nil_converter(h) }
    }).each.with_index do |row, index|
      @total_rows_count = @total_rows_count + 1
      cleaner = CsvRowCleaner.new(row)
      next if cleaner.dirty_data?

      cleaner.transform_row
      block.call(row, index)
      @processed_rows_count = @processed_rows_count + 1
    end
    nil
  end

  # This doesn't return a valid value until after iterating, because we're streaming and
  # don't parse all at once
  def size
    @processed_rows_count
  end

  private
  def nil_converter(value)
    value == NIL_CODE ? nil : value
  end
end
