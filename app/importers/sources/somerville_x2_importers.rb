class SomervilleX2Importers

  def initialize(options = {})
    @school_scope = options["school"]
    @first_time = options["first_time"]
    @x2_file_importers = options["x2_file_importers"]
    @progress_bar = options["progress_bar"]
    @log = options["test_mode"] ? LogHelper::Redirect.instance.file : STDOUT
  end

  def sftp_client
    @client ||= SftpClient.for_x2
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

  def file_importer_classes
    @x2_file_importers.map do |importer_option|
      SomervilleX2Importers.file_importer_options.fetch(importer_option)
    end.compact.uniq
  end

  def file_importers
    file_importer_classes.map do |file_importer_class|
      file_importer_class.new(@school_scope, sftp_client, @log, @progress_bar)
    end
  end

end
