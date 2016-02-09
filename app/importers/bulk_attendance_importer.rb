class BulkAttendanceImporter

  def initialize(options = {})
    # Required
    @client = options[:client]

    # Optional
    @school_scope = options["school"]
    @recent_only = options["recent_only"]
    @first_time = options["first_time"]
  end

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "absence", "tardy", "event_date", "school_local_id" ]

    'attendance_export.txt'
  end

  def data_transformer
    CsvTransformer.new
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
