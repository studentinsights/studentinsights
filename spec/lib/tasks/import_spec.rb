require 'rails_helper'
load File.expand_path('../../../../lib/tasks/import.thor', __FILE__)

RSpec.describe Import do
  let(:task) { Import::Start.new }

  describe '.start' do
    before do
      allow(SftpClient).to receive_messages(for_x2: sftp_client_double, for_star: sftp_client_double)
    end

    let(:sftp_client_double) { double(read_file: 'meow') }
    let(:commands) { Import::Start.start(%w[--test-mode]) }

    it 'invokes all the commands and returns the correct kind of values' do
      expect(commands[1]).to eq nil
      expect(commands[2]).to eq ['HEA']
      expect(commands[3]).to be_a Array
      expect(commands[4]).to eq []
      expect(commands[5]).to eq nil
    end

    let(:importers) { commands[3] }
    let(:first_importer) { importers[0] }
    let(:second_importer) { importers[1] }

    it 'returns the correct importers' do
      expect(importers.size).to eq 2

      expect(first_importer).to be_a Importer
      expect(second_importer).to be_a Importer

      expect(first_importer.client).to eq sftp_client_double
      expect(first_importer.file_importers.map { |i| i.class }).to eq [
        StudentsImporter,
        X2AssessmentImporter,
        BehaviorImporter,
        EducatorsImporter,
        AttendanceImporter
      ]

      expect(second_importer.client).to eq sftp_client_double
      expect(second_importer.file_importers.map { |i| i.class }).to eq [
        StarReadingImporter,
        StarReadingImporter::HistoricalImporter,
        StarMathImporter,
        StarMathImporter::HistoricalImporter
      ]
    end

  end

  describe '#importers' do
    context 'when provided with the default sources' do
      it 'returns X2 and STAR importers' do
        expect(task.importers(['x2', 'star'])).to eq([SomervilleX2Importers, SomervilleStarImporters])
      end
    end
    context 'when provided with a duplicated source' do
      it 'returns just one reference to the requested importer' do
        expect(task.importers(['x2', 'x2'])).to eq([SomervilleX2Importers])
      end
    end
    context 'when provided with invalid sources' do
      it 'returns an empty array' do
        expect(task.importers(['x3'])).to eq([])
      end
    end
  end

  describe '#load_rails' do
    it 'defines Rails' do
      expect(task).to receive(:require).with(/config\/environment.rb/)
      task.load_rails
    end
  end

  describe '#schools' do
    context 'when passed a valid school local ID' do
      it 'returns the school local ID' do
        expect(task.school_local_ids(['HEA'])).to eq ["HEA"]
      end
    end
    context 'when passed the ELEM shorthand id' do
      it 'returns all elementary school IDs' do
        expect(task.school_local_ids(['ELEM'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS
        ]
      end
    end
    context 'when passed the ELEM shorthand and a valid school local id in the ELEM list' do
      it 'returns all elementary school IDs' do
        expect(task.school_local_ids(['ELEM', 'HEA'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS
        ]
      end
    end
    context 'when passed the ELEM shorthand and another valid school local id' do
      it 'returns all elementary school IDs and the other id' do
        expect(task.school_local_ids(['ELEM', 'SHS'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS SHS
        ]
      end
    end
  end

  describe '#connect_transform_import' do
    let(:fake_importer) { double(:importer) }
    let(:fake_importer_set) { double(:importers, from_options: [fake_importer]) }

    before { allow(task).to receive(:importers).and_return([fake_importer_set]) }

    it 'calls #connect_transform_import on configured importers' do
      expect(fake_importer).to receive(:connect_transform_import)
      task.connect_transform_import
    end
  end
end
