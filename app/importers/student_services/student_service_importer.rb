class StudentServiceImporter

  def import
    puts "Files in remote server: #{file_names_in_remote_server}"; puts

    puts "Files that haven't been uploaded: #{file_names_to_upload.size}"; puts

    puts "Importing new services..."

    puts csvs_to_upload; puts
  end

  protected

  def csvs_to_upload
    file_names_to_upload.map do |file_name|
      sftp_client.read_file("services_upload/#{file_name}")
    end
  end

  def file_names_to_upload
    file_names_in_remote_server - files_names_already_uploaded
  end

  def file_names_in_remote_server
    files_in_remote_server.map(&:name)
  end

  def files_in_remote_server
    sftp.dir.entries("services_upload").select do |entry|
      (entry.name != '.') && (entry.name != '..')
    end
  end

  def files_names_already_uploaded
    ServiceUpload.pluck(:file_name)
  end

  def sftp
    @sftp_session ||= sftp_client.sftp_session
  end

  def sftp_client
    @client ||= SftpClient.for_x2
  end

end
