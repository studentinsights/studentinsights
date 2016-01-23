class BulkAttendanceImporter

  def initialize(options = {})
    # Required
    @client = options[:client]
    @data_transformer = options[:data_transformer]

    # Optional
    @school_scope = options[:school_scope]
    @recent_only = options[:recent_only]
    @first_time = options[:first_time]
  end

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "absence", "tardy", "event_date", "school_local_id" ]

    'attendance_export.txt'
  end

  def connect_transform_import
    file = @client.read_file(remote_file_name)
    data = @data_transformer.transform(file)
    start_import(data)
  end

  def start_import(data)
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
        school_year = DateToSchoolYear.new(row[:event_date]).convert
        sql_row = "(#{student.id}, '#{row[:absence]}', '#{row[:tardy]}', '#{row[:event_date]}', '#{school_year.id}', clock_timestamp(), clock_timestamp())"
        sql_rows.push(sql_row)
      end
    end
    return sql_rows
  end

  alias_method :connect_transform_import_locally, :connect_transform_import

end
