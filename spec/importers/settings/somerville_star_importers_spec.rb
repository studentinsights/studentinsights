require 'rails_helper'

RSpec.describe SomervilleStarImporters do

  describe 'credentials' do
    let(:star_importer) { described_class.new.importer }

    before do
      # Mock ENV to include X2 SFTP credentials
      allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return('ridiculously valid host')
      allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return('ridiculously valid user')
      allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return('ridiculously valid password')
    end

    context 'with no options' do
      let(:options) { {} }
      let(:client) { star_importer.client }

      it 'sets the right SIS SFTP client credentials' do
        expect(client).to be_a SftpClient
        expect(client.credentials[:host]).to eq('ridiculously valid host')
        expect(client.credentials[:user]).to eq('ridiculously valid user')
        expect(client.credentials[:password]).to eq('ridiculously valid password')
      end
    end
  end

  describe 'file_importers' do
    let(:importer) { described_class.new({}).importer }
    let(:file_importers) { importer.file_importers }
    it 'returns an array of importers' do
      expect(file_importers).to include(a_kind_of(StarReadingImporter))
      expect(file_importers).to include(a_kind_of(StarMathImporter))
      expect(file_importers).to include(a_kind_of(StarReadingImporter::HistoricalImporter))
      expect(file_importers).to include(a_kind_of(StarMathImporter::HistoricalImporter))
    end
  end

end

