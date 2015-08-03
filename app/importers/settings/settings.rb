class Settings

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @district_scope = options[:district_scope]
    @recent_only = options[:recent_only]
  end

  def configure
    case @district_scope
    when "Somerville"
      Settings::SomervilleSettings.new.configuration
    when "KIPP NJ"
      Settings::KippNjSettings.new.configuration
    else
      raise "don't know about that school district buddy"
    end
  end

  class SomervilleSettings

    def base_options
      {
        school_scope: @school_scope,
        recent_only: @recent_only
      }
    end

    def x2_sftp_credentials
      {
        user: ENV['SIS_SFTP_USER'],
        host: ENV['SIS_SFTP_HOST'],
        key_data: ENV['SIS_SFTP_KEY']
      }
    end

    def star_sftp_credentials
      {
        user: ENV['STAR_SFTP_USER'],
        host: ENV['STAR_SFTP_HOST'],
        password: ENV['STAR_SFTP_PASSWORD']
      }
    end

    def students_options
      students_options = base_options.clone
      students_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'students_export.txt'})
      students_options[:data_transformer] = X2ExportCsvTransformer.new
      return students_options
    end

    def assessment_options
      assessment_options = base_options.clone
      assessment_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'assessment_export.txt'})
      assessment_options[:data_transformer] = X2ExportCsvTransformer.new
      return assessment_options
    end

    def star_math_options
      star_math_options = base_options.clone
      star_math_options[:client] = SftpClient.new({credentials: star_sftp_credentials, remote_file_name: 'SM.csv'})
      star_math_options[:data_transformer] = StarMathCsvTransformer.new
      return star_math_options
    end

    def star_reading_options
      star_reading_options = base_options.clone
      star_reading_options[:client] = SftpClient.new({credentials: star_sftp_credentials, remote_file_name: 'SR.csv'})
      star_reading_options[:data_transformer] = StarReadingCsvTransformer.new
      return star_reading_options
    end

    def behavior_options
      behavior_options = base_options.clone
      behavior_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'behavior_export.txt'})
      behavior_options[:data_transformer] = X2ExportCsvTransformer.new
      return behavior_options
    end

    def attendance_options
      attendance_options = base_options.clone
      attendance_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'attendance_export.txt'})
      attendance_options[:data_transformer] = X2ExportCsvTransformer.new
      return attendance_options
    end

    def configuration
      [
        StudentsImporter.new(students_options),
        X2AssessmentImporter.new(assessment_options),
        StarMathImporter.new(star_math_options),
        StarReadingImporter.new(star_reading_options),
        BehaviorImporter.new(behavior_options),
        AttendanceImporter.new(attendance_options)
      ]
    end
  end

  class KippNjSettings

    def base_options
      {
        school_scope: @school_scope,
        recent_only: @recent_only,
        data_transformer: JsonTransformer.new
      }
    end

    def students_options
      students_options = base_options.clone
      students_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'students.json'})
      return students_options
    end

    def assessment_options
      assessment_options = base_options.clone
      assessment_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'assess.json'})
      return assessment_options
    end

    def behavior_options
      attendance_options = base_options.clone
      attendance_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'disc.json'})
      return attendance_options
    end

    def attendance_options
      behavior_options = base_options.clone
      behavior_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'att.json'})
      return behavior_options
    end

    def configuration
      [
        StudentsImporter.new(students_options),
        X2AssessmentImporter.new(assessment_options),
        BehaviorImporter.new(behavior_options),
        AttendanceImporter.new(attendance_options)
      ]
    end

    def aws_credentials
      {
        key: ENV['KIPP_NJ_AWS_KEY'],
        secret_key: ENV['KIPP_NJ_AWS_SECRET_KEY'],
        bucket_name: ENV['KIPP_NJ_AWS_BUCKET_NAME'],
        region: 'us-east-1'
      }
    end

  end

end
