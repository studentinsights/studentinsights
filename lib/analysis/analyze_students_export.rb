require 'csv'

class AnalyzeStudentsExport < Struct.new :path

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

  def nil_converter(value)
    value unless value == '\N'
  end

  def data
    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: ->(h) { nil_converter(h) }
    }

    @parsed_csv ||= CSV.parse(contents, csv_options)
  end

  def find_future_registration_dates
    data.each do |row|
      parse_registration_date_for_row(row)
    end
  end

  def parse_registration_date_for_row(row)
    registration_date = row[:registration_date]
    local_id = row[:local_id]
    grade = row[:grade]

    begin
      return puts "#{local_id} (#{grade}): no registration date" unless registration_date

      parsed_date = DateTime.parse(registration_date)

      return puts "#{local_id} (#{grade}): FUTURE DATE #{row[:registration_date]}" if registration_date > DateTime.current

      return puts "#{local_id} (#{grade}): #{row[:registration_date]}"
    rescue ArgumentError => e
      puts "#{local_id} (#{grade}): ArgumentError"
    end
  end

end
