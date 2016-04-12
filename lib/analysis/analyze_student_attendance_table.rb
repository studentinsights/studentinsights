require 'csv'

class AnalyzeStudentAttendanceTable < Struct.new(:path)

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

  def select_by_column(column, value)
    data.select { |row| row[column] == value }
  end

  def count_for_column(column, value)
    select_by_column(column, value).size
  end

  def total
    @total ||= data.length
  end

  def count_versus_total(column, value)
    count = count_for_column(column, value)
    percentage = 100 * count.to_f / total.to_f

    "#{column} => #{count} out of #{total} (#{percentage}%)"
  end

end
