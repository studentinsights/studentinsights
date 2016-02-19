require 'spec_helper'
load File.expand_path('../../../../lib/tasks/import.thor', __FILE__)

RSpec.describe Import do
  let(:task) { Import::Start.new }

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
