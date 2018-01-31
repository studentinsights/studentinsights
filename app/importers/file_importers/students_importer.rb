class StudentsImporter < Struct.new

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
    end
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STUDENTS_IMPORT', nil)
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    student = StudentRow.new(row, school_ids_dictionary).build
    return if student.registration_date_in_future

    student.save!
    student.update_risk_level!

    if row[:homeroom].present?
      assign_student_to_homeroom(student, row[:homeroom])
    end
  end

  def assign_student_to_homeroom(student, homeroom_name)
    return unless student.active?

    homeroom = Homeroom.where({
      name: homeroom_name,
      school: student.school
    }).first_or_create!

    homeroom.students << student
  end

end
