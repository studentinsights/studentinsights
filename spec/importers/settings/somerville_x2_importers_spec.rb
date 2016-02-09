require 'rails_helper'

RSpec.describe SomervilleX2Importers do

  describe '#options' do
    let(:importer) { described_class.new(options).importer }

    before do
      # Mock ENV to include X2 SFTP credentials
      allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return('totes valid host')
      allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return('totes valid user')
      allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return('totes valid key')
    end

    context 'with no options' do
      let(:options) { {} }
      let(:client) { importer.client }
      it 'sets the right SIS SFTP client' do
        expect(client).to be_a SftpClient
        expect(client.credentials[:host]).to eq('totes valid host')
        expect(client.credentials[:user]).to eq('totes valid user')
        expect(client.credentials[:key_data]).to eq('totes valid key')
      end
      it 'returns importer with no school_scope or first_time flag' do
        expect(importer.school_scope).to be_nil
        expect(importer.first_time).to be_nil
      end
    end

    context 'with school scope' do
      let(:school) { School.create }
      let(:options) { { "school" => school } }
      it 'returns importer with school_scope' do
        expect(importer.school_scope).to eq school
      end
    end

    context 'with first time setting' do
      let(:options) { { "first_time" => true } }
      it 'returns first time importer' do
        expect(importer).to be_a Array
        expect(importer.first).to be_a Importer
        expect(importer.second).to be_a BulkAttendanceImporter
      end
    end
  end

  describe 'x2 importer file_importers' do
    let(:importer) { described_class.new({}).importer }
    let(:file_importers) { importer.file_importers }
    it 'returns an array of importers' do
      expect(file_importers).to include(a_kind_of(StudentsImporter))
      expect(file_importers).to include(a_kind_of(StudentAssessmentImporter))
      expect(file_importers).to include(a_kind_of(BehaviorImporter))
      expect(file_importers).to include(a_kind_of(EducatorsImporter))
    end
  end

end

