class CsvTransformer
  require 'csv'

  def transform(file)
    csv = CSV.parse(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
    csv.delete_if do |row|
      CsvRowCleaner.new(row).dirty_data?
    end
    csv.each do |row|
      cleaner = CsvRowCleaner.new(row)
      cleaner.transform_row
    end
    return csv
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end

end
