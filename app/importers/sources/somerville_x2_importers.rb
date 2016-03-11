class SomervilleX2Importers
  def self.from_options(options)
    new(options).importer
  end

  def initialize(options = {})
    @school_scope = options["school"]
    @first_time = options["first_time"]
    @x2_file_importers = options["x2_file_importers"]
  end

  def base_options
    {
      school_scope: @school_scope,
      client: SftpClient.for_x2,
      file_importers: file_importers.map(&:new)
    }
  end

  def self.file_importer_options
    {
      'students' => StudentsImporter,
      'assessments' => X2AssessmentImporter,
      'behavior' => BehaviorImporter,
      'educators' => EducatorsImporter,
      'attendance' => AttendanceImporter,
    }
  end

  def self.file_importer_names
    self.file_importer_options.keys
  end

  def file_importers
    @x2_file_importers.map do |importer_option|
      unless importer_option == 'attendance' && @first_time
        SomervilleX2Importers.file_importer_options.fetch(importer_option)
      end
    end.compact.uniq
  end

  def importer
    importer_set = [Importer.new(base_options)]
    importer_set << BulkAttendanceImporter.new(base_options) if include_bulk_attendance?
    importer_set
  end

  private

  def include_bulk_attendance?
    @first_time && @x2_file_importers.include?('attendance')
  end

end
