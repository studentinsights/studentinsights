require 'rails_helper'

RSpec.describe KippNjImporters do

  describe '#configuration' do
    let(:importer) { described_class.new(options).importer }

    context 'with no options' do
      let(:options) { {} }
      it 'returns importer with no school_scope or first_time flag' do
        expect(importer.school_scope).to be_nil
        expect(importer.first_time).to be_nil
      end
    end

    context 'with school scope' do
      let(:school) { School.create }
      let(:options) { { school_scope: school } }
      it 'returns importer with school_scope' do
        expect(importer.school_scope).to eq school
      end
    end

    context 'with first time setting' do
      let(:options) { { first_time: true } }
      it 'returns first time importer' do
        expect(importer.first_time).to be true
      end
    end
  end
end

