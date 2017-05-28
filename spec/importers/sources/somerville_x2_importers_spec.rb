require 'rails_helper'

RSpec.describe SomervilleX2Importers do
  let(:first_time) { nil }
  let(:x2_file_importers) { ["students", "assessments", "behavior", "educators", "attendance"] }

  let(:options) {
    {
      "first_time" => first_time,
      "x2_file_importers" => x2_file_importers
    }
  }

  let(:importer_factory) { SomervilleX2Importers.new(options) }
  before { allow(SftpClient).to receive(:for_x2) }

  describe '#file_importer_classes' do
    it 'returns an default set of importers' do
      expect(importer_factory.file_importer_classes).to eq [
        StudentsImporter, X2AssessmentImporter, BehaviorImporter, EducatorsImporter, AttendanceImporter
      ]
    end

    context 'when passed non-default options' do

      context 'when passed an empty array' do
        let(:x2_file_importers) { [] }
        it 'returns an empty array' do
          expect(importer_factory.file_importer_classes).to eq []
        end
      end

      context 'when passed a single valid x2 file importer name' do
        let(:x2_file_importers) { ['students'] }
        it 'returns an array containing the specified importer' do
          expect(importer_factory.file_importer_classes).to eq [StudentsImporter]
        end
      end

      context 'when passed duplicate x2 file importer names' do
        let(:x2_file_importers) { ['students', 'students'] }
        it 'returns an array containing the specified importer' do
          expect(importer_factory.file_importer_classes).to eq [StudentsImporter]
        end
      end

      context 'when passed different valid x2 file importer names' do
        let(:x2_file_importers) { ['students', 'assessments'] }
        it 'returns an array containing the specified importers' do
          expect(importer_factory.file_importer_classes).to eq [StudentsImporter, X2AssessmentImporter]
        end
      end

      context 'when passed an invalid x2 file importer name' do
        let(:x2_file_importers) { ['mud'] }
        it 'throws an error' do
          expect { importer_factory.file_importer_classes }.to raise_error KeyError
        end
      end

    end
  end

end

