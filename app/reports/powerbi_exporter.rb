require 'csv'

# Creates a CSV string of flat tables
class PowerBIExporter
  def init(options = {})
    @time_now = options[:now] || Time.now
    @cutoff_date = @time_now - 3.years
  end

  def students
    hashes_to_csv_string Student.all.map(&:as_json)
  end

  def homerooms
    hashes_to_csv_string Homeroom.all.map(&:as_json)
  end

  def schools
    hashes_to_csv_string School.all.map(&:as_json)
  end

  def educators
    hashes_to_csv_string Educator.all.map(&:as_json)
  end

  def absences
    hashes_to_csv_string Absence.all.map(&:as_json)
  end

  def tardies
    hashes_to_csv_string Tardy.all.map(&:as_json)
  end

  private
  def hashes_to_csv_string(row_hashes)
    header_row = row_hashes.first.keys # all rows should have the same shape
    body_rows = row_hashes.map {|row_hash| row_hash.values }
    ([header_row] + body_rows).map {|row| row.to_csv }.join('')
  end

end
