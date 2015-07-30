class ImportInitializer

  def self.somerville_x2_sftp_credentials
    {
      user: ENV['SIS_SFTP_USER'],
      host: ENV['SIS_SFTP_HOST'],
      key_data: ENV['SIS_SFTP_KEY']
    }
  end

  def self.somerville_star_sftp_credentials
    {
      user: ENV['STAR_SFTP_USER'],
      host: ENV['STAR_SFTP_HOST'],
      password: ENV['STAR_SFTP_PASSWORD']
    }
  end

  def self.kipp_nj_aws_credentials
    {
      key: ENV['KIPP_NJ_AWS_KEY'],
      secret_key: ENV['KIPP_NJ_AWS_SECRET_KEY'],
      bucket_name: ENV['KIPP_NJ_AWS_BUCKET_NAME']
    }
  end

  def self.import_classes
    [
      StudentsImporter.new({
        client: SftpClient.new(somerville_x2_sftp_credentials, 'students_export.txt'),
        data_transformer: X2ExportCsvTransformer.new
      }),
      X2AssessmentImporter.new({
        client: SftpClient.new(somerville_x2_sftp_credentials, 'assessment_export.txt'),
        data_transformer: X2ExportCsvTransformer.new
      }),
      StarMathImporter.new({
        client: SftpClient.new(somerville_star_sftp_credentials, 'SM.csv'),
        data_transformer: StarMathCsvTransformer.new
      }),
      StarReadingImporter.new({
        client: SftpClient.new(somerville_star_sftp_credentials, 'SR.csv'),
        data_transformer: StarReadingCsvTransformer.new
      }),
      BehaviorImporter.new({
        client: SftpClient.new(somerville_x2_sftp_credentials, 'behavior_export.txt'),
        data_transformer: X2ExportCsvTransformer.new
      }),
      AttendanceImporter.new({
        client: SftpClient.new(somerville_x2_sftp_credentials, 'attendance_export.txt'),
        data_transformer: X2ExportCsvTransformer.new
      })
    ]
  end

  def self.import
    import_classes.each do |i|
      begin
        i.connect_transform_import
      rescue Exception => message
        puts message
      end
    end
    if Rails.env.development?
      puts "#{Student.count} students"
      puts "#{Assessment.count} assessments"
      puts "#{DisciplineIncident.count} discipline incidents"
      puts "#{AttendanceEvent.count} attendance events"
    end
  end
end
