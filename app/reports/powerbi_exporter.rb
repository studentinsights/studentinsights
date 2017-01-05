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
    hashes_to_csv_string absences_or_tardies(:absences)
  end

  def tardies
    hashes_to_csv_string absences_or_tardies(:tardies)
  end

  private
  def hashes_to_csv_string(row_hashes)
    header_row = row_hashes.first.keys # all rows should have the same shape
    body_rows = row_hashes.map {|row_hash| row_hash.values }
    ([header_row] + body_rows).map {|row| row.to_csv }.join('')
  end

  # Returns a list of hashes of Tardies or Absences for CSV export.
  # It does some joins so `student_id` is directly available on the exported CSV,
  # rather than having to go through student_school_year.
  def absences_or_tardies(method_symbol)
    school_year_ids = SchoolYear.in_between_dates(@cutoff_date, @time_now).map(&:id)
    student_school_years = StudentSchoolYear.all.includes(method_symbol).select do |student_school_year|
      school_year_ids.include?(student_school_year.school_year_id)
    end
    student_school_years.flat_map(&method_symbol).map do |record|
      record.as_json.merge(student_id: record.student_school_year.student_id)
    end
  end
end