require 'rails_helper'

RSpec.describe StudentRow do

  describe '#split_first_and_last_name' do
    let(:student_row) { described_class.new(row) }

    context 'well formatted name' do
      let(:row) { { full_name: 'Hoag, George' } }

      it 'assigns the first and last name correctly' do
        expect(student_row.split_first_and_last_name).to eq(
          { first_name: 'George', last_name: 'Hoag' }
        )
      end
    end

    context 'poorly formatted name' do
      let(:row) { { full_name: 'Hoag' } }

      it 'assigns the result to the last name' do
        expect(student_row.split_first_and_last_name).to eq(
          { first_name: nil, last_name: 'Hoag' }
        )
      end
    end
  end

end
