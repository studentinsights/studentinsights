class AttendanceImporter < BaseCsvImporter
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
    return if Time.current - 90.days > row[:event_date]

    AttendanceRow.build(row).save!
  end
end
