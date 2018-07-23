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
    log('Downloading...')
    file_contents = download_file
    log("file_contents.size: #{file_contents.size}")

    log('Transforming...')
    @transformer.transform(file_contents)
  end

  def download_file
    log("Downloading remote file name: #{@remote_file_name}")

    downloaded_file = @client.download_file(@remote_file_name)
    File.read(downloaded_file)
  end

  private
  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "CsvDownloader: #{text}"
  end
end
