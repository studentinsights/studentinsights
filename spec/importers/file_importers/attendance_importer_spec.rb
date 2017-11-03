require 'rails_helper'

RSpec.describe AttendanceImporter do

  let(:importer) { described_class.new }

  describe '#import_row' do

    context 'recent attendance events' do
      before do
        Timecop.freeze('2005-09-16')
      end

      after do
        Timecop.return
      end

      context 'one row for one student on one date' do
        let!(:student) { FactoryGirl.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        context 'row with absence' do
          let(:row) {
            { event_date: date, local_id: '1', absence: '1', tardy: '0' }
          }

          it 'creates an absence' do
            expect {
              described_class.new.import_row(row)
            }.to change {
              Absence.count
            }.by 1
          end

          it 'creates only 1 absence if run twice' do
            expect {
              described_class.new.import_row(row)
              described_class.new.import_row(row)
            }.to change { Absence.count }.by 1
          end

          it 'increments student absences by 1' do
            expect {
              described_class.new.import_row(row)
            }.to change {
              student.reload.absences.size
            }.by 1
          end

          it 'does not increment student tardies' do
            expect {
              described_class.new.import_row(row)
            }.to change {
              student.tardies.size
            }.by 0
          end
        end
      end

      context 'multiple rows for different students on the same date' do

        let!(:edwin) { FactoryGirl.create(:student, local_id: '1', first_name: 'Edwin') }
        let!(:kristen) { FactoryGirl.create(:student, local_id: '2', first_name: 'Kristen') }
        let(:date) { '2005-09-16' }

        let(:row_for_edwin) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:row_for_kristen) { { event_date: date, local_id: '2', absence: '1', tardy: '0' } }

        it 'creates an absence for each student' do
          expect {
            described_class.new.import_row(row_for_edwin)
            described_class.new.import_row(row_for_kristen)
          }.to change { Absence.count }.by 2
        end
      end

      context 'multiple rows for same student on same date' do
        let!(:student) { FactoryGirl.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        let(:first_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }

        it 'creates an absence' do
          expect {
            described_class.new.import_row(first_row)
            described_class.new.import_row(second_row)
          }.to change { Absence.count }.by 1
        end
      end

      context 'multiple rows for same student on different dates' do
        let!(:student) { FactoryGirl.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        let(:first_row) { { event_date: '2005-09-16', local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: '2005-09-17', local_id: '1', absence: '1', tardy: '0' } }
        let(:third_row) { { event_date: '2005-09-18', local_id: '1', absence: '1', tardy: '0' } }
        let(:fourth_row) { { event_date: '2005-09-19', local_id: '1', absence: '1', tardy: '0' } }

        it 'creates multiple absences' do
          importer = described_class.new
          expect {
            importer.import_row(first_row)
            importer.import_row(second_row)
            importer.import_row(third_row)
            importer.import_row(fourth_row)
          }.to change { Absence.count }.by 4
        end
      end
    end

    context 'old attendance events' do
      context 'one row for one student on one date' do
        let!(:student) { FactoryGirl.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        context 'row with absence' do
          let(:row) {
            { event_date: date, local_id: '1', absence: '1', tardy: '0' }
          }

          it 'does not create an absence' do
            expect {
              described_class.new.import_row(row)
            }.to change {
              Absence.count
            }.by 0
          end
        end
      end
    end
  end
end
