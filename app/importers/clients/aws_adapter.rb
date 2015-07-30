class AwsAdapter < Struct.new :credentials, :export_file_name

  def s3_client
    if aws_credentials_present?
      Aws.config.update({
        region: credentials[:region],
        credentials: Aws::Credentials.new(credentials[:key], credentials[:secret_key])
      })
      return Aws::S3::Client.new
    else
      raise "AWS information missing"
    end
  end

  def fetch_file
    resp = s3_client.get_object(bucket: credentials[:bucket_name], key: export_file_name)
    return resp.body.read
  end

  def aws_credentials_present?
    credentials[:key].present? &&
    credentials[:secret_key].present? &&
    credentials[:bucket_name].present?
  end

end
