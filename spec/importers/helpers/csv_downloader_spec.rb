require 'rails_helper'

RSpec.describe CsvDownloader do
  it 'avoids logging full filename paths' do
    log = LogHelper::FakeLog.new
    transformer = StreamingCsvTransformer.new(log)
    csv_downloader = CsvDownloader.new({
      log: log,
      client: SftpClient.for_x2,
      remote_file_name: '/pathway/secret/filename.csv',
      transformer: transformer
    })
    allow(csv_downloader).to receive(:download_file).and_return 'foo-file-contents'

    expect(csv_downloader.get_data).to eq transformer
    expect(log.output).to include("Downloading remote basename 'filename.csv'...")
  end
end
