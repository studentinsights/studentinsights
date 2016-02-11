require 'csv'

class AnalyzeStudentAttendance < Struct.new(:path)
  def contents
    File.read(path).gsub(/\\\"/, '')
  end

  def data
    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: lambda { |h| nil_converter(h) }
    }

    @rows ||= begin
      rows = []
      CSV.parse(contents, csv_options) { |row| rows << row }
      rows
    end
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end

  def select_by_column_value(column_name, column_value)
    data.select { |row| row[column_name] == column_value }
  end

  def count_for_column_value(column_name, column_value)
    select_by_column_value(column_name, column_value).size
  end

  def count_versus_total(column_name, column_value)
    "#{column_name}  =>  #{count_for_column_value(column_name, column_value)} out of #{data.length}"
  end

end
