module StarCsvTransformer
  require 'csv'

  attr_accessor :pre_cleanup_csv_size

  def transform(file)
    csv = CSV.parse(file, headers: true, header_converters: lambda { |h| convert_headers(h) })
    @pre_cleanup_csv_size = csv.size
    csv
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      header = header_dictionary[header]
    end
  end
end
