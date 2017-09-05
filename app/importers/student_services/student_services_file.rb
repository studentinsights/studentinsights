require 'csv'

class StudentServicesFile < Struct.new :file_name, :sftp_client, :log

  def service_upload
    @upload ||= ServiceUpload.create!(file_name: file_name)
  end

  def service_type_code
    file_name.split('-')[0]
  end

  SERVICE_TYPE_CODE_TO_NAME = {
    'SPELL' => 'Summer Program for English Language Learners',
    'SomerSession' => 'SomerSession',
    'ReadingIntervention' => 'Reading intervention',
    'ATP' => 'Afterschool Tutoring',
  }

  def service_type_name
    SERVICE_TYPE_CODE_TO_NAME.fetch(service_type_code)
  end

  def recorded_at
    Time.new
  end

  def date_started
    Date.strptime(csv[0][:start_date], '%D')
  end

  def has_end_date?
    csv[0][:end_date].present?
  end

  def date_ended
    Date.strptime(csv[0][:end_date], '%D')
  end

  def recorded_by_educator
    Educator.find_by_id!(ENV["URI_ID"])
  end

  def service_type
    ServiceType.find_by_name!(service_type_name)
  end

  def import
    csv_to_students

    @present_students.map { |student| create_service_for_student(student) }

    log.puts "#{service_type_name} imported for #{@present_students.size} students.";
    log.puts

    return if @missing_student_names == []

    log.puts "Unable to match these students against the database: #{@missing_student_names.join(', ')}";
    log.puts
  end

  def create_service_for_student(student)
    return if service_type.id == 507 && # Reading intervention
              student.services
                     .where(service_type_id: 507)
                     .select { |service| service.active? }.size > 0

    service = Service.create!(
      student: student,
      service_upload: service_upload,
      recorded_by_educator: recorded_by_educator,
      service_type: service_type,
      recorded_at: recorded_at,
      date_started: date_started
    )

    return unless has_end_date?

    DiscontinuedService.create!(
      service: service,
      discontinued_at: date_ended,
      recorded_by_educator: recorded_by_educator,
    )
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
