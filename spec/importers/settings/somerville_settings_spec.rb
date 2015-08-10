require 'rails_helper'

RSpec.describe Settings::SomervilleSettings do

  describe '#configuration' do
    let(:configuration) { Settings::SomervilleSettings.new(options).configuration }
    let(:first_importer) { configuration[0] }
    context 'with no options' do
      let(:options) { {} }
      it 'returns an array of importers' do
        expect(configuration).to be_a Array
        expect(first_importer).to be_a StudentsImporter
      end
      it 'returns importer with no school_scope, first_time, or recent_only' do
        expect(first_importer.school_scope).to be_nil
        expect(first_importer.recent_only).to be_nil
        expect(first_importer.first_time).to be_nil
      end
    end
    context 'with school scope' do
      let(:school) { School.create }
      let(:options) { { school_scope: school } }
      it 'returns importer with school_scope' do
        expect(first_importer.school_scope).to eq school
        expect(first_importer.recent_only).to be_nil
        expect(first_importer.first_time).to be_nil
      end
    end
    context 'with first time setting' do
      let(:options) { { first_time: true } }
      it 'returns first time importer' do
        expect(first_importer.school_scope).to be_nil
        expect(first_importer.recent_only).to be_nil
        expect(first_importer.first_time).to be true
      end
    end
  end

end

