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

    context 'grade level KF' do
      let(:row) { { grade: 'KF', full_name: 'Lee, Nico' } }

      it 'sets grade to KF' do
        expect(student.grade).to eq 'KF'
      end
    end

    context 'grade level 02' do
      let(:row) { { grade: '02', full_name: 'Lee, Nico' } }

      it 'sets grade to 2' do
        expect(student.grade).to eq '2'
      end
    end

    context 'counselor field' do
      let(:row) { { counselor: 'LASTNAME, I x-0000', full_name: 'Martinez, Juan' } }

      it 'correctly sets the counselor name to lastname portion' do
        expect(student.counselor).to eq 'LASTNAME'
      end
    end

    context 'counselor field no comma' do
      let(:row) { { counselor: 'LASTNAME', full_name: 'Gutierrez, Gustavo'} }

      it 'correctly sets the counselor name to lastname portion' do
        expect(student.counselor).to eq 'LASTNAME'
      end
    end
  end

end
