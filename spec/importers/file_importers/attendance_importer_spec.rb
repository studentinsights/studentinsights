require 'rails_helper'

RSpec.describe AttendanceImporter do

  def make_attendance_importer(options = {})
    importer = AttendanceImporter.new(options: {
      school_scope: nil,
      log: nil,
      skip_old_records: false
    }.merge(options))
    importer.instance_variable_set(:@skipped_from_school_filter, 0)
    importer.instance_variable_set(:@skipped_old_rows_count, 0)
    importer.instance_variable_set(:@skipped_other_rows_count, 0)
    importer.instance_variable_set(:@unchanged_rows_count, 0)
    importer.instance_variable_set(:@updated_rows_count, 0)
    importer.instance_variable_set(:@created_rows_count, 0)
    importer.instance_variable_set(:@invalid_rows_count, 0)
    importer
  end

  describe '#import_row' do
    let(:attendance_importer) { make_attendance_importer }

    context 'recent attendance events' do
      before { Timecop.freeze('2005-09-16') }
      after { Timecop.return }

      context 'one row for one student on one date' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        context 'row with absence (Somerville)' do
          # Default ENV['DISTRICT_KEY'] for test suite is 'somerville', see test.rb

          let(:row) {
            { event_date: date, local_id: '1', absence: '1', tardy: '0',
              dismissed: '0', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
          }

          it 'creates an absence' do
            expect {
              attendance_importer.import_row(row)
            }.to change {
              Absence.count
            }.by 1
          end

          it 'sets the right attributes' do
            attendance_importer.import_row(row)
            absence = Absence.first

            expect(absence.dismissed).to eq false
            expect(absence.reason).to eq 'Medical'
            expect(absence.excused).to eq false
            expect(absence.comment).to eq 'Received doctor note.'
          end

          it 'creates only 1 absence if run twice' do
            expect {
              attendance_importer.import_row(row)
              attendance_importer.import_row(row)
            }.to change { Absence.count }.by 1
          end

          it 'increments student absences by 1' do
            expect {
              attendance_importer.import_row(row)
            }.to change {
              student.reload.absences.size
            }.by 1
          end

          it 'does not increment student tardies' do
            expect {
              attendance_importer.import_row(row)
            }.to change {
              student.tardies.size
            }.by 0
          end
        end
      end

      context 'row with absence (New Bedford)' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        let(:row) {
          { event_date: date, local_id: '1', absence: '1', tardy: '0',
            dismissed: '0', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
        }

        it 'creates an absence' do
          expect {
            attendance_importer.import_row(row)
          }.to change {
            Absence.count
          }.by 1
        end

        before do
          # Default ENV['DISTRICT_KEY'] for test suite is 'somerville', see test.rb
          expect(ENV).to receive(:[]).with('DISTRICT_KEY').and_return("new_bedford")
        end

        it 'sets the right attributes' do
          attendance_importer.import_row(row)
          absence = Absence.first

          expect(absence.dismissed).to eq nil
          expect(absence.reason).to eq nil
          expect(absence.excused).to eq nil
          expect(absence.comment).to eq nil
        end
      end

      context 'multiple rows for different students on the same date' do

        let!(:edwin) { FactoryBot.create(:student, local_id: '1', first_name: 'Edwin') }
        let!(:kristen) { FactoryBot.create(:student, local_id: '2', first_name: 'Kristen') }
        let(:date) { '2005-09-16' }

        let(:row_for_edwin) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:row_for_kristen) { { event_date: date, local_id: '2', absence: '1', tardy: '0' } }

        it 'creates an absence for each student' do
          expect {
            attendance_importer.import_row(row_for_edwin)
            attendance_importer.import_row(row_for_kristen)
          }.to change { Absence.count }.by 2
        end
      end

      context 'multiple rows for same student on same date' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        let(:first_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }

        it 'creates an absence' do
          expect {
            attendance_importer.import_row(first_row)
            attendance_importer.import_row(second_row)
          }.to change { Absence.count }.by 1
        end
      end

      context 'multiple rows for same student on different dates' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { '2005-09-16' }

        let(:first_row) { { event_date: '2005-09-16', local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: '2005-09-17', local_id: '1', absence: '1', tardy: '0' } }
        let(:third_row) { { event_date: '2005-09-18', local_id: '1', absence: '1', tardy: '0' } }
        let(:fourth_row) { { event_date: '2005-09-19', local_id: '1', absence: '1', tardy: '0' } }

        it 'creates multiple absences' do
          expect {
            attendance_importer.import_row(first_row)
            attendance_importer.import_row(second_row)
            attendance_importer.import_row(third_row)
            attendance_importer.import_row(fourth_row)
          }.to change { Absence.count }.by 4
        end
      end
    end

    context 'old attendance events' do
      let!(:student) { FactoryBot.create(:student, local_id: '1') }
      let(:date) { '2005-09-16' }
      let(:row) {
        { event_date: date, local_id: '1', absence: '1', tardy: '0' }
      }

      context '--skip_old_records flag on' do
        it 'does not create an absence' do
          expect {
            make_attendance_importer(skip_old_records: true).import_row(row)
          }.to change {
            Absence.count
          }.by 0
        end
      end

      context '--skip_old_records flag off' do
        it 'creates an absence' do
          expect {
            make_attendance_importer.import_row(row)
          }.to change {
            Absence.count
          }.by 1
        end
      end

    end
  end

end
