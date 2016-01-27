require 'rails_helper'

RSpec.describe AttendanceRow do
  let(:absence) { true }
  let(:tardy) { false }
  let(:data) do
    {
      local_id: 'student-id',
      event_date: DateTime.parse('1981-12-30'),
      absence: absence,
      tardy: tardy,
    }
  end

  subject(:row) { AttendanceRow.new(data) }

  describe '#build' do
    context 'when the row is an absence' do
      it 'saves an absence' do
        expect { row.build.save! }.to change(Absence, :count).by(1)
      end
    end

    context 'when the row is a tardy' do
      let(:absence) { false }
      let(:tardy) { true }

      it 'saves a tardy' do
        expect { row.build.save! }.to change(Tardy, :count).by(1)
      end
    end

    context 'when the row is neither absence nor tardy' do
      let(:absence) { false }

      it 'does not save an absence' do
        expect { row.build.save! }.not_to change(Absence, :count)
      end

      it 'does not save a tardy' do
        expect { row.build.save! }.not_to change(Tardy, :count)
      end
    end

    it 'creates the appropriate school year' do
      expect { row.build }.to change(SchoolYear, :count).by(1)
      expect(SchoolYear.last.name).to eq('1981-1982')
    end

    it 'creates the appropriate student record' do
      expect { row.build }.to change(Student, :count).by(1)
      expect(Student.last.local_id).to eq('student-id')
    end
  end
end
