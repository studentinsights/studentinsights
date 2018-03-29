require 'csv'

class CsvTransformer

  attr_accessor :pre_cleanup_csv_size

  def initialize(options={})
    @headers=options.key?(:headers) ? options[:headers] : true
  end

  # Performs whole-file transformations first
  # Enforce UTF8 encoding and
  # Replace \" within fields to just ", to satisfy the strict Ruby CSV parser
  def transform(csv_string)
    cleaned_contents = csv_string.encode('UTF-8', 'binary', {
      invalid: :replace,
      undef: :replace,
      replace: ''
    }).gsub("\\\"", "")

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
