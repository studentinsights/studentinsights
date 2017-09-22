class AttendanceImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'attendance_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def import_row(row)
    occurred_at = DateTime.parse(row[:event_date])

    return if Time.current - 90.days > occurred_at

    AttendanceRow.build(row).save!
  end
end
