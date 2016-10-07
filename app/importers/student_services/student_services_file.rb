class StudentServicesFile < Struct.new :file_name, :sftp_client

  def service_upload
    @upload ||= ServiceUpload.create!(file_name: file_name)
  end

  def service_type_code
    file_name.split('-')[0]
  end

  SERVICE_TYPE_CODE_TO_NAME = {
    'SPELL' => 'Summer Program for English Language Learners',
    'SomerSession' => 'SomerSession'
  }

  def service_type_name
    SERVICE_TYPE_CODE_TO_NAME.fetch(service_type_code)
  end

  def recorded_at
    Time.new
  end

  def date_started
    csv[0][:start_date]
  end

  def import
    csv_to_students

    @present_students.map do |student|
      Service.create!(
        student: student,
        service_upload: service_upload,
        recorded_by_educator_id: ENV["URI_ID"],
        service_type: ServiceType.find_by_name!(service_type_name),
        recorded_at: recorded_at,
        date_started: date_started
      )
    end

    puts "#{service_type_name} imported for #{@present_students.size} students."; puts

    return if @missing_student_names == []

    puts "Unable to match these students against the database: #{@missing_student_names.join(', ')}"; puts
  end

  def row_to_student(row)
    student = Student.find_by_local_id(row[:lasid])

    if student.present?
      @present_students << student
    else
      @missing_student_names << "#{row[:last_name]} (#{row[:lasid]})"
    end
  end

  def csv_to_students
    @present_students = []
    @missing_student_names = []

    csv.map { |row| row_to_student(row) }
  end

  def csv
    @parsed_csv ||= CSV.parse(file, headers: true, header_converters: :symbol)
  end

  def file
    @uploaded_file ||= sftp_client.read_file("services_upload/#{file_name}")
  end

end
