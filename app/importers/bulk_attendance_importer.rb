class BulkAttendanceImporter
  include Connector

  def import(data)
    sql_rows = make_sql_rows(data)
    sql = "INSERT INTO attendance_events (student_id, absence, tardy, event_date)
           VALUES #{sql_rows.join(", ")};"
    ActiveRecord::Base.connection.execute(sql)
  end

  def make_sql_rows(data)
    sql_rows = []
    data.each do |row|
      student = Student.where(local_id: row[:local_id]).first_or_create!
      sql_rows.push "(#{student.id}, '#{row[:absence]}', '#{row[:tardy]}', '#{row[:event_date]}')"
    end
    return sql_rows
  end

  alias_method :import_locally, :import
end
