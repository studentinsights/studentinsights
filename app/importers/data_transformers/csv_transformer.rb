class CsvTransformer
  require 'csv'

  def transform(file)
    csv = CSV.parse(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
    csv.delete_if do |row|
      cleaner = CsvRowCleaner.new(row)
      !cleaner.clean_date?
    end
    csv.delete_if do |row|
      cleaner = CsvRowCleaner.new(row)
      !cleaner.clean_booleans?
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
