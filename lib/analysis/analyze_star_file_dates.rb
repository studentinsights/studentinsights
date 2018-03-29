require 'csv'
require 'date'

class AnalyzeStarFileDates < Struct.new(:path)
  # Intended for use manually on the console
  def console_analysis
    csv = CSV.read(path, headers: true)
    sorted_csv = csv.map { |row| star_date_to_ruby_date(row["AssessmentDate"]) }
    puts 'First date:'
    puts sorted_csv.first
    puts
    puts
    puts 'Last date:'
    puts sorted_csv.last
  end

  private
  def star_date_to_ruby_date(star_date)
    date_part = star_date.split(' ')[0]
    month = date_part.split('/')[0].to_i
    day = date_part.split('/')[1].to_i
    year = date_part.split('/')[2].to_i
    return Date.new(year, month, day)
  end
end
