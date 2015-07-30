class AwsClient < Struct.new :credentials, :export_file_name

  def fetch_file
  end

  def aws_credentials_present?
    credentials[:key].present? &&
    credentials[:secret_key].present? &&
    credentials[:bucket_name].present?
  end
end
