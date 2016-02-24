class SomervilleX2Importers
  def self.from_options(options)
    new(options).importer
  end

  def initialize(options = {})
    @school_scope = options["school"]
    @first_time = options["first_time"]
  end

  def base_options
    {
      school_scope: @school_scope,
      client: SftpClient.for_x2,
      file_importers: file_importers.map(&:new)
    }
  end

  def file_importers
    importers = [
      StudentsImporter,
      X2AssessmentImporter,
      BehaviorImporter,
      EducatorsImporter,
    ]
    importers << AttendanceImporter unless @first_time
    importers
  end

  def importer
    importer_set = [Importer.new(base_options)]
    importer_set << BulkAttendanceImporter.new(base_options) if @first_time
    importer_set
  end

end
