class X2ExportCsvTransformer
  require 'csv'

  def transform(file)
    CSV.parse(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end
end
