require 'csv'

class AnalyzeEducatorsExport < Struct.new :path

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

  def get_educators_for_school(school_local_id)
    puts data.select { |row| row[:school_local_id] == school_local_id }
        .map { |row| present_educator(row) }
  end

  def present_educator(row)
    educator_view = "#{row[:full_name]} – #{row[:homeroom] || 'No homeroom'}"
    educator_view += " – Admin" if row[:staff_type] == "Administrator"
    educator_view
  end

end
