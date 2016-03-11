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

  describe '.from_options' do
    it 'returns an array containing one importer' do
      expect(described_class.from_options(options).length).to eq(1)
      expect(described_class.from_options(options).first).to be_an_instance_of(Importer)
    end
  end

  describe '#file_importers' do
    it 'returns an default set of importers' do
      expect(importer_factory.file_importers).to eq [
        StudentsImporter, X2AssessmentImporter, BehaviorImporter, EducatorsImporter, AttendanceImporter
      ]
    end

    context 'when factorying importers for a first-time import' do
      let(:first_time) { true }
      it 'does not include the attendance importer' do
        expect(importer_factory.file_importers).to eq [
          StudentsImporter, X2AssessmentImporter, BehaviorImporter, EducatorsImporter
        ]
      end
    end

    context 'when passed non-default options' do

      context 'when passed an empty array' do
        let(:x2_file_importers) { [] }
        it 'returns an empty array' do
          expect(importer_factory.file_importers).to eq []
        end
      end

      context 'when passed a single valid x2 file importer name' do
        let(:x2_file_importers) { ['students'] }
        it 'returns an array containing the specified importer' do
          expect(importer_factory.file_importers).to eq [StudentsImporter]
        end
      end

      context 'when passed duplicate x2 file importer names' do
        let(:x2_file_importers) { ['students', 'students'] }
        it 'returns an array containing the specified importer' do
          expect(importer_factory.file_importers).to eq [StudentsImporter]
        end
      end

      context 'when passed different valid x2 file importer names' do
        let(:x2_file_importers) { ['students', 'assessments'] }
        it 'returns an array containing the specified importers' do
          expect(importer_factory.file_importers).to eq [StudentsImporter, X2AssessmentImporter]
        end
      end

      context 'when passed an invalid x2 file importer name' do
        let(:x2_file_importers) { ['mud'] }
        it 'throws an error' do
          expect { importer_factory.file_importers }.to raise_error KeyError
        end
      end

    end
  end

  describe '#importer' do

    context 'default' do
      it 'returns one generic importer' do
        expect(importer_factory.importer.size).to eq 1
        expect(importer_factory.importer.first).to be_a Importer
      end
    end

    context 'first time import' do
      let(:first_time) { true }
      it 'returns one generic importer and one bulk attendance importer' do
        expect(importer_factory.importer.size).to eq 2
        expect(importer_factory.importer.first).to be_a Importer
        expect(importer_factory.importer.second).to be_a BulkAttendanceImporter
      end
    end

  end

end

