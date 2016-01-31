require 'rails_helper'

RSpec.describe StudentRow do

  describe '#name_view_attributes' do
    let(:student_row) { described_class.new(row) }

    context 'well formatted name' do
      let(:row) { { full_name: 'Hoag, George' } }

      it 'assigns the first and last name correctly' do
        expect(student_row.name_view_attributes).to eq(
          { first_name: 'George', last_name: 'Hoag' }
        )
      end
    end

    context 'poorly formatted name' do
      let(:row) { { full_name: 'Hoag' } }

      it 'assigns the result to the last name' do
        expect(student_row.name_view_attributes).to eq(
          { first_name: nil, last_name: 'Hoag' }
        )
      end
    end
  end

end
