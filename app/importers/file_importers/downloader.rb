class Downloader

  def initialize(log:, client:, remote_file_name:, transformer:)
    @log = log
    @client = client
    @remote_file_name = remote_file_name
    @transformer = transformer
  end

  def get_data
    file = download_file

    data = @transformer.transform(file)

    CleanupReport.new(
      @log, @remote_file_name, @transformer.pre_cleanup_csv_size, data.size
    ).print

    return data
  end

  def download_file
    @log.write("\nDownloading #{@remote_file_name}...")

    downloaded_file = @client.download_file(@remote_file_name)

    File.read(downloaded_file).encode('UTF-8', 'binary', {
      invalid: :replace, undef: :replace, replace: ''
    })
  end

end
