require 'pathname'

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
    log("Downloading remote basename '#{basename}'...")
    file_contents = download_file
    log("file_contents.size: #{file_contents.size}")

    if file_contents.size == 0
      raise "CsvDownloader: file size is 0 bytes"
    end

    log('Transforming...')
    @transformer.transform(file_contents)
  end

  def download_file
    downloaded_file = @client.download_file(@remote_file_name)
    File.read(downloaded_file)
  end

  private
  # Avoid logging full paths of remote file system
  def basename
    Pathname.new(@remote_file_name).basename
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "CsvDownloader: #{text}"
  end
end
