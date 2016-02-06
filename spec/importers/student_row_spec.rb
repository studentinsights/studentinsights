require 'rails_helper'

RSpec.describe StudentRow do

  describe '#build' do

    let(:student_row) { described_class.new(row) }
    let(:student) { student_row.build }

    context 'well formatted name' do
      let(:row) { { full_name: 'Hoag, George' } }

      it 'assigns the first and last name correctly' do
        expect(student.first_name).to eq 'George'
        expect(student.last_name).to eq 'Hoag'
      end
    end

    context 'poorly formatted name' do
      let(:row) { { full_name: 'Hoag' } }

      it 'assigns the result to the last name' do
        expect(student.first_name).to eq nil
        expect(student.last_name).to eq 'Hoag'
      end
    end

  end

end
