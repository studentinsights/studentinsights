class AttendanceImporter < Struct.new :school_scope, :client

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
    AttendanceRow.build(row).save!
  end
end
