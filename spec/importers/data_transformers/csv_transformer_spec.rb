require 'rails_helper'

RSpec.describe CsvTransformer do

  describe '#transform' do
    context 'with good data' do
      let!(:file) { File.open("#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }
      let(:transformer) { CsvTransformer.new }
      it 'returns a CSV' do
        expect(transformer.transform(file)).to be_a_kind_of CSV::Table
      end
    end
  end
end

