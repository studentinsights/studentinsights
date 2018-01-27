# This is a service object that works with importer classes. It factors out
# shared logic that downloads CSVs and cleans them up before import.
class CsvDownloader

  def initialize(log:, client:, remote_file_name:, transformer:)
    @log = log
    @client = client
    @remote_file_name = remote_file_name
    @transformer = transformer
  end

  def get_data
    file_contents = download_file

    data = @transformer.transform(file_contents)

    CleanupReport.new(
      @log, @remote_file_name, @transformer.pre_cleanup_csv_size, data.size
    ).print

    return data
  end

  def download_file
    @log.write("\nDownloading #{@remote_file_name}...")
    
    downloaded_file = @client.download_file(@remote_file_name)
    File.read(downloaded_file)
  end

end
