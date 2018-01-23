require 'csv'

class CsvTransformer

  attr_accessor :pre_cleanup_csv_size

  def initialize(options={})
    @headers=options.key?(:headers) ? options[:headers] : true
  end

  def transform(file)
    csv = CSV.parse(cleaned_file, headers: @headers,
                                  header_converters: :symbol,
                                  converters: lambda { |h| nil_converter(h) },
                                  liberal_parsing: true)

    @pre_cleanup_csv_size = csv.size

    csv.delete_if { |row| CsvRowCleaner.new(row).dirty_data? }

    csv.each { |row| CsvRowCleaner.new(row).transform_row }

    csv
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end
end
