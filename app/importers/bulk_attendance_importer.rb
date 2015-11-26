class BulkAttendanceImporter
  include Connector
  include AssignToSchoolYear

  def import(data)
    sql_rows = make_sql_rows(data)
    sql = "INSERT INTO attendance_events (student_id, absence, tardy, event_date, school_year_id, created_at, updated_at)
           VALUES #{sql_rows.join(", ")};"
    ActiveRecord::Base.connection.execute(sql)
  end

  def make_sql_rows(data)
    sql_rows = []
    ActiveRecord::Base.transaction do
      data.each do |row|
        student = Student.where(local_id: row[:local_id]).first_or_create!
        school_year = date_to_school_year(row[:event_date])
        sql_row = "(#{student.id}, '#{row[:absence]}', '#{row[:tardy]}', '#{row[:event_date]}', '#{school_year.id}', clock_timestamp(), clock_timestamp())"
        sql_rows.push(sql_row)
      end
    end
    return sql_rows
  end

  alias_method :import_locally, :import
end
