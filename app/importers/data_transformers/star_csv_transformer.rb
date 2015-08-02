module StarCsvTransformer
  require 'csv'

  def transform(file)
    CSV.parse(file, headers: true, header_converters: lambda { |h| convert_headers(h) })
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      header = header_dictionary[header]
    end
  end
end
