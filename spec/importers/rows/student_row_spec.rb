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

    context 'invalid registration_date' do
      let(:row) { { full_name: 'Hoag, George', registration_date: '02' } }

      it 'sets it as nil' do
        expect(student.registration_date).to eq nil
      end
    end

    context 'empty string sped_placement' do
      let(:row) { { full_name: 'Hoag, George', sped_placement: '' } }

      it 'sets it as nil' do
        expect(student.sped_placement).to eq nil
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

    context 'sped_liaison field' do
      let(:row) { { sped_liaison: 'MILNER', full_name: 'Martinez, Juan' } }

      it 'correctly sets the sped_liaison field' do
        expect(student.sped_liaison).to eq 'MILNER'
      end
    end

    context 'ELL date fields' do
      let(:row) do
        {
          ell_entry_date: '2013-09-24',
          ell_transition_date: '2015-06-28',
          limited_english_proficiency: 'FLEP',
          full_name: 'Martinez, Juan'
        }
      end

      it 'correctly sets ELL date fields on the Student record' do
        expect(student.ell_entry_date).to eq Date.parse('2013-09-24')
        expect(student.ell_transition_date).to eq Date.parse('2015-06-28')
        expect(student.limited_english_proficiency).to eq 'FLEP'
      end
    end

    context 'when no ELL date fields' do
      let(:row) do
        {
          limited_english_proficiency: 'FLEP',
          full_name: 'Martinez, Juan'
        }
      end

      it 'does not raise and sets the ELL date fields as nil on the Student record' do
        expect(student.ell_entry_date).to eq nil
        expect(student.ell_transition_date).to eq nil
        expect(student.limited_english_proficiency).to eq 'FLEP'
      end
    end

    context 'when PerDistrict attributes are not exported' do
      before do
        mock_per_district = PerDistrict.new
        allow(mock_per_district).to receive(:import_student_house?).and_return(false)
        allow(mock_per_district).to receive(:import_student_counselor?).and_return(false)
        allow(mock_per_district).to receive(:import_student_sped_liaison?).and_return(false)
        allow(PerDistrict).to receive(:new).and_return(mock_per_district)
      end

      it 'does not try to read and leaves them as nil' do
        row = { full_name: 'Martinez, Juan' }
        student_row = StudentRow.new(row)
        student = student_row.build
        expect(student.counselor).to eq nil
        expect(student.house).to eq nil
        expect(student.sped_liaison).to eq nil
      end
    end
  end

end
