class Settings

  def self.for(district_name)
    case district_name
    when "Somerville"
      somerville_import
    when "KIPP NJ"
      kipp_nj_import
    else
      raise "don't know about that school district buddy"
    end
  end

  def self.somerville_import
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

  def self.kipp_nj_import
    [
      AttendanceImporter.new({
        client: AwsAdapter.new(kipp_nj_aws_credentials, 'att.json'),
        data_transformer: JsonTransformer.new
      }),
      StudentsImporter.new({
        client: AwsAdapter.new(kipp_nj_aws_credentials, 'students.json'),
        data_transformer: JsonTransformer.new
      }),
      X2AssessmentImporter.new({
        client: AwsAdapter.new(kipp_nj_aws_credentials, 'att.json'),
        data_transformer: JsonTransformer.new
      }),
      BehaviorImporter.new({
        client: AwsAdapter.new(kipp_nj_aws_credentials, 'att.json'),
        data_transformer: JsonTransformer.new
      })
    ]
  end

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
      bucket_name: ENV['KIPP_NJ_AWS_BUCKET_NAME'],
      region: 'us-east-1'
    }
  end
end
