require 'rails_helper'

RSpec.describe Settings::SomervilleSettings do

  describe '#x2_importers' do
    let(:x2_importers) { described_class.new(options).x2_importers }

    before do
      # Mock ENV to include X2 SFTP credentials
      allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return('totes valid host')
      allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return('totes valid user')
      allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return('totes valid key')
    end

    context 'with no options' do
      let(:options) { {} }
      let(:client) { x2_importers[0].client }
      let(:data_transformer) { x2_importers[0].data_transformer }

      it 'sets the right SIS SFTP client' do
        expect(client).to be_a SftpClient
        expect(client.credentials[:host]).to eq('totes valid host')
        expect(client.credentials[:user]).to eq('totes valid user')
        expect(client.credentials[:key_data]).to eq('totes valid key')
      end
      it 'sets the right data transformer' do
        expect(data_transformer).to be_a CsvTransformer
      end
      it 'returns importer with no school_scope, first_time, or recent_only' do
        expect(x2_importers[0].school_scope).to be_nil
        expect(x2_importers[0].recent_only).to be_nil
        expect(x2_importers[0].first_time).to be_nil
      end
    end
    context 'with school scope' do
      let(:school) { School.create }
      let(:options) { { school_scope: school } }
      it 'returns importer with school_scope' do
        expect(x2_importers[0].school_scope).to eq school
      end
    end
    context 'with first time setting' do
      let(:options) { { first_time: true } }
      it 'returns first time importer' do
        expect(x2_importers[0].first_time).to be true
      end
    end
  end

  describe '#star_importers' do
    let(:star_importers) { described_class.new(options).star_importers }

    before do
      # Mock ENV to include X2 SFTP credentials
      allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return('ridiculously valid host')
      allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return('ridiculously valid user')
      allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return('ridiculously valid password')
    end

    context 'with no options' do
      let(:options) { {} }
      let(:client) { star_importers[0].client }
      let(:data_transformer) { star_importers[0].data_transformer }

      it 'sets the right SIS SFTP client' do
        expect(client).to be_a SftpClient
        expect(client.credentials[:host]).to eq('ridiculously valid host')
        expect(client.credentials[:user]).to eq('ridiculously valid user')
        expect(client.credentials[:password]).to eq('ridiculously valid password')
      end
      it 'sets the right data transformer' do
        expect(data_transformer).to be_a StarReadingCsvTransformer
      end
      it 'returns importer with no school_scope, first_time, or recent_only' do
        expect(star_importers[0].school_scope).to be_nil
        expect(star_importers[0].recent_only).to be_nil
        expect(star_importers[0].first_time).to be_nil
      end
    end
  end

  describe '#configuration' do
    let(:configuration) { described_class.new({}).configuration }
    it 'returns an array of importers' do
      expect(configuration).to include(a_kind_of(StudentsImporter))
      expect(configuration).to include(a_kind_of(StudentAssessmentImporter))
      expect(configuration).to include(a_kind_of(StarReadingImporter))
      expect(configuration).to include(a_kind_of(StarMathImporter))
      expect(configuration).to include(a_kind_of(StarReadingImporter::HistoricalImporter))
      expect(configuration).to include(a_kind_of(StarMathImporter::HistoricalImporter))
      expect(configuration).to include(a_kind_of(BehaviorImporter))
      expect(configuration).to include(a_kind_of(EducatorsImporter))
      expect(configuration).not_to include(a_kind_of(HealeyAfterSchoolTutoringImporter))  # Only in development
    end
  end

end

