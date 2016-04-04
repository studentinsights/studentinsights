require 'csv'

class AnalyzeAssessments < Struct.new(:path)

  def contents
    encoding_options = {
      invalid: :replace,
      undef: :replace,
      replace: ''
    }

    @file ||= File.read(path).encode('UTF-8', 'binary', encoding_options)
                             .gsub(/\\\\/, '')
                             .gsub(/\\"/, '')
  end

  def data
    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: ->(h) { nil_converter(h) }
    }

    @parsed_csv ||= CSV.parse(contents, csv_options)
  end

  def nil_converter(value)
    value unless value == '\N'
  end

  def dibels
    data.select { |row| row[:asd_name].include?('DIBELS') }
  end

  def access
    data.select { |row| row[:asd_name].include?('ACCESS') }
  end

end
