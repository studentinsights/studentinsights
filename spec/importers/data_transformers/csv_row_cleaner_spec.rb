require 'csv'
require 'rails_helper'

RSpec.describe CsvRowCleaner do

  let(:transformed_row) { described_class.new(row).transform_row }

  describe '#transform_row' do

    context 'row with dates' do
      let(:row) { CSV::Row.new([:event_date, :pizza_slices_count], ['2015-10-01', '10']) }

      it 'parses the date into a Ruby date' do
        expect(transformed_row[:event_date]).to eq Date.new(2015, 10, 1)
        expect(transformed_row[:pizza_slices_count]).to eq '10'
      end
    end

    context 'row without dates' do
      let(:row) { CSV::Row.new([:pizza_slices_type, :pizza_slices_count], ['veggie', '10']) }

      it 'does nothing' do
        expect(transformed_row).to eq row
      end
    end

  end

end
