require 'rails_helper'

RSpec.describe AttendanceRow do
  let(:absence) { '1' }
  let(:tardy) { '0' }

  describe '#build' do

    context 'row has student ID' do
      let!(:student) { FactoryBot.create(:student) }
      let(:data) {
        {
          local_id: student.local_id,
          event_date: DateTime.parse('1981-12-30'),
          absence: absence,
          tardy: tardy,
        }
      }
      subject(:row) { AttendanceRow.new(data, student.id) }

      context 'when the row is an absence' do
        it 'saves an absence' do
          expect { row.build.save }.to change(Absence, :count).by(1)
        end
      end

      context 'when the row is a tardy' do
        let(:absence) { '0' }
        let(:tardy) { '1' }

        it 'saves a tardy' do
          expect { row.build.save }.to change(Tardy, :count).by(1)
        end
      end

      context 'when the row is neither absence nor tardy' do
        let(:absence) { '0' }

        it 'does not save an absence' do
          expect { row.build }.not_to change(Absence, :count)
          expect(row.build).to eq nil
        end

        it 'does not save a tardy' do
          expect { row.build }.not_to change(Tardy, :count)
          expect(row.build).to eq nil
        end
      end
    end
  end
end
