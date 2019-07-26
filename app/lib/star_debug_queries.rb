# typed: true
class StarDebugQueries
  def fetch_json(students, options = {})
    cutoff_date = options.fetch(:cutoff_date, SchoolYear.first_day_of_school_for_year(2017))

    star_readings = StarReadingResult.all
      .where(student_id: students.pluck(:id))
      .where('date_taken > ?', cutoff_date)
    students_json = students.as_json({
      only: [
        :id,
        :first_name,
        :last_name,
        :grade,
        :school_id
      ]
    })
    schools_json = School.all.as_json

    {
      students: students_json,
      star_readings: star_readings,
      cutoff_date: cutoff_date,
      schools: schools_json
    }
  end

  def fetch_csv(options = {})
    json = fetch_json(options)
    students = json[:students]
    star_readings = json[:star_readings]

    # to csv
    students_by_id = {}
    students.each {|s| students_by_id[s.id] = s }
    rows = star_readings.map do |star|
      student = students_by_id[star.student_id]
      star.as_json.merge({
        school_id: student.school_id,
        grade: student.grade
      })
    end
    hashes_to_csv_string(rows)
  end

  private
  def hashes_to_csv_string(row_hashes)
    header_row = row_hashes.first.keys # all rows should have the same shape
    body_rows = row_hashes.map {|row_hash| row_hash.values }
    ([header_row] + body_rows).map {|row| row.to_csv }.join('')
  end
end
