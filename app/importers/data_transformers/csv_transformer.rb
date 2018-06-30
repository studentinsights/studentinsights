require 'csv'

# This is deprecated.
# See `StreamingCsvTransformer`, which is faster and uses less memory.
class CsvTransformer

  attr_accessor :pre_cleanup_csv_size

  def initialize(log, options={})
    @log = log
    @headers=options.key?(:headers) ? options[:headers] : true
  end

  # Performs whole-file transformations first
  def transform(csv_string)
    cleaned_contents = ParseableCsvString.new(@log).from_string(csv_string)

    csv = CSV.parse(cleaned_contents, headers: @headers,
                          header_converters: :symbol,
                          converters: lambda { |h| nil_converter(h) })

    @pre_cleanup_csv_size = csv.size

    csv.delete_if { |row| CsvRowCleaner.new(row).dirty_data? }

    csv.each { |row| CsvRowCleaner.new(row).transform_row }

    csv
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end
end
