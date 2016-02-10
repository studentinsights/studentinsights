require 'csv'

class StudentAttendanceDataAnalysis

  def initialize

    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: lambda { |h| nil_converter(h) }
    }

    @data = []

    CSV.foreach(PATH_TO_FILE, csv_options) do |row|
      @data << row
      break if $. == 100000     # Start with the first 100,000 rows for now because after that
                                # we start getting: Missing or stray quote (CSV::MalformedCSVError)
                                # TODO: Fix this.
    end

    @data_size = @data.size
  end


  def nil_converter(value)
    value == '\N' ? nil : value
  end

  def select_by_column_value(column_name, column_value)
    @data.select { |row| row[column_name] == column_value }
  end

  def count_for_column_value(column_name, column_value)
    select_by_column_value(column_name, column_value).size
  end

  def count_versus_total(column_name, column_value)
    "#{column_name}  =>  #{count_for_column_value(column_name, column_value)} out of #{@data_size}"
  end

end

analysis = StudentAttendanceDataAnalysis.new

indicators = [ :att_tardy_ind, :att_tardy_ind_02,
               :att_dismissed_ind, :att_dismissed_ind_02,
               :att_excused_ind, :att_excused_ind_02,
               :att_absent_ind, :att_absent_ind_02 ]

puts 'COUNTS FOR INDICATOR == "1" (TRUE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '1')
end

puts; puts

puts 'COUNTS FOR INDICATOR == "0" (FALSE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '0')
end


# From the Aspen / X2 data dictionary:

# ATT_ABSENT_IND => Absent?
# ATT_ABSENT_IND_02 => Absent PM?
# ATT_DISMISSED_IND => Dismissed?
# ATT_DISMISSED_IND_02 => Dismissed PM?
# ATT_EXCUSED_IND => Excused?
# ATT_EXCUSED_IND_02 => Excused PM?
# ATT_TARDY_IND => Tardy?
# ATT_TARDY_IND_02 => Tardy PM?
