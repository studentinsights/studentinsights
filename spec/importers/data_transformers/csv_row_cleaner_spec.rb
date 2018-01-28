require 'csv'
require 'rails_helper'

RSpec.describe CsvRowCleaner do

  let(:row_cleaner) { described_class.new(row) }
  let(:transformed_row) { row_cleaner.transform_row }

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

  describe '#clean_date?' do

    context 'there is a date column' do
      context 'Ruby can parse the date' do

        context 'date is not in the future or the far past' do
          let(:row) { CSV::Row.new([:event_date, :pizza_slices_count], ['2015-10-11', '3']) }
          it 'returns true' do
            expect(row_cleaner.send(:clean_date?)).to eq true
          end
        end

        context 'date is in the future' do
          let(:row) {
            CSV::Row.new([:event_date, :pizza_slices_count], ['2215-10-11', '3'])
          }
          it 'returns true' do
            expect(row_cleaner.send(:clean_date?)).to eq false
          end

        end

        context 'date is in the far past' do
          let(:row) {
            CSV::Row.new([:event_date, :pizza_slices_count], ['1015-10-11', '3'])
          }
          it 'returns true' do
            expect(row_cleaner.send(:clean_date?)).to eq false
          end
        end

      end

      context 'date is total garbage' do
        let(:row) { CSV::Row.new([:event_date, :pizza_slices_count], ['** loud noise **', '3']) }

        it 'returns false' do
          expect(row_cleaner.send(:clean_date?)).to eq false
        end
      end

      context 'date deeply illogical' do
        let(:row) { CSV::Row.new([:event_date, :pizza_slices_count], ['2015-13-11', '3']) }

        it 'returns false' do
          expect(row_cleaner.send(:clean_date?)).to eq false
        end
      end
    end

    context 'there is no date column' do
      let(:row) { CSV::Row.new([:pizza_type, :pizza_slices_count], ['tofu', '3']) }

      it 'returns false' do
        expect(row_cleaner.send(:clean_date?)).to eq true
      end
    end

  end

  describe '#clean_booleans?' do

    context 'there is a boolean column' do

      context 'is parsable' do
        let(:row) { CSV::Row.new([:event_name, :has_exact_time], ['Pizza Party No. 2', '0']) }
        it 'returns true' do
          expect(row_cleaner.send(:clean_booleans?)).to eq true

        end
      end

      context 'not parsable' do
        let(:row) { CSV::Row.new([:event_name, :has_exact_time], ['Pizza Party No. 2', ':-/']) }
        it 'returns false' do
          expect(row_cleaner.send(:clean_booleans?)).to eq false
        end
      end

    end

    context 'there are no boolean columns' do
      let(:row) { CSV::Row.new([:event_date, :pizza_slices_count], ['2015-13-11', '3']) }

      it 'returns true' do
        expect(row_cleaner.send(:clean_booleans?)).to eq true
      end
    end

  end

end
