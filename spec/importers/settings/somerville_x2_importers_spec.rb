require 'rails_helper'

RSpec.describe SomervilleX2Importers do
  let(:first_time) { nil }
  let(:options) { { "first_time" => first_time } }
  let(:importer_factory) { SomervilleX2Importers.new(options) }
  before { allow(SftpClient).to receive(:for_x2) }

  describe '.from_options' do
    it 'returns an array containing one importer' do
      expect(described_class.from_options(options).length).to eq(1)
      expect(described_class.from_options(options).first).to be_an_instance_of(Importer)
    end
  end

  describe '#file_importers' do
    it 'returns an default set of importers' do
      expect(importer_factory.file_importers).to eq([
        StudentsImporter,
        X2AssessmentImporter,
        BehaviorImporter,
        EducatorsImporter,
        AttendanceImporter
      ])
    end

    context 'when factorying importers for a first-time import' do
      let(:first_time) { true }

      it 'does not include the attendance importer' do
        expect(importer_factory.file_importers).not_to include(AttendanceImporter)
      end
    end
  end

end

