class BulkAttendanceImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def initialize(options = {})
    # Required
    @client = options[:client]

    # Optional
    @school_scope = options["school"]
    @first_time = options["first_time"]
  end

  def remote_file_name
    'attendance_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def connect_transform_import
    file = @client.read_file(remote_file_name)
    data = data_transformer.transform(file)
    start_import(data)
  end

  def start_import(data)
    attendance_events = data.map { |row| AttendanceRow.new(row).build }
    absences = attendance_events.select { |event| event.is_a?(Absence) }
    tardies = attendance_events.select { |event| event.is_a?(Tardy) }
    Absence.import(absences)
    Tardy.import(tardies)
  end

end
