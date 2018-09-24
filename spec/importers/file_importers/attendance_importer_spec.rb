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
    importer
  end

  def make_row(hash = {})
    {
      local_id: FactoryBot.create(:student).local_id,
      event_date: Date.parse('1981-12-30'),
    }.merge(hash)
  end

  describe '#import_row' do
    let(:attendance_importer) { make_attendance_importer }

    context 'recent attendance events' do
      before { Timecop.freeze('2005-09-17') }
      after { Timecop.return }

      context 'one row for one student on one date' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { Date.parse('2005-09-16') }

        context 'row with absence (Somerville)' do
          # Default ENV['DISTRICT_KEY'] for test suite is 'somerville', see test.rb

          let(:row) {
            { event_date: date, local_id: '1', absence: '1', tardy: '0',
              dismissed: '0', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
          }

          it 'creates an absence' do
            expect {
              attendance_importer.send(:import_row, row)
            }.to change {
              Absence.count
            }.by 1
          end

          it 'sets the right attributes' do
            attendance_importer.send(:import_row, row)
            absence = Absence.first

            expect(absence.dismissed).to eq false
            expect(absence.reason).to eq 'Medical'
            expect(absence.excused).to eq false
            expect(absence.comment).to eq 'Received doctor note.'
          end

          it 'creates only 1 absence if run twice' do
            expect {
              attendance_importer.send(:import_row, row)
              attendance_importer.send(:import_row, row)
            }.to change { Absence.count }.by 1
          end

          it 'increments student absences by 1' do
            expect {
              attendance_importer.send(:import_row, row)
            }.to change {
              student.reload.absences.size
            }.by 1
          end

          it 'does not increment student tardies' do
            expect {
              attendance_importer.send(:import_row, row)
            }.to change {
              student.tardies.size
            }.by 0
          end
        end
      end

      context 'row with absence (New Bedford)' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { Date.parse('2005-09-16') }

        let(:row) {
          { event_date: date, local_id: '1', absence: '1', tardy: '0',
            dismissed: '0', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
        }

        it 'creates an absence' do
          expect {
            attendance_importer.send(:import_row, row)
          }.to change {
            Absence.count
          }.by 1
        end

        before do
          # Default ENV['DISTRICT_KEY'] for test suite is 'somerville', see test.rb
          allow(ENV).to receive(:[]).with('DISTRICT_KEY').and_return("new_bedford")
        end

        it 'sets the right attributes' do
          attendance_importer.send(:import_row, row)
          absence = Absence.first

          expect(absence.dismissed).to eq nil
          expect(absence.reason).to eq nil
          expect(absence.excused).to eq nil
          expect(absence.comment).to eq nil
        end
      end

      context 'row with absence (Bedford)' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { Date.parse('2005-09-16') }
        let(:row) {
          { event_date: date, local_id: '1', absence: 'true', tardy: 'false',
            dismissed: 'false', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
        }

        before do
          allow(ENV).to receive(:[]).with('DISTRICT_KEY').and_return('bedford')
        end

        it 'creates an absence, parsing true/false correctly' do
          expect {
            attendance_importer.send(:import_row, row)
          }.to change {
            Absence.count
          }.by 1
        end

        it 'sets the right attributes for defailed fields' do
          attendance_importer.send(:import_row, row)
          absence = Absence.first

          expect(absence.dismissed).to eq false
          expect(absence.reason).to eq 'Medical'
          expect(absence.excused).to eq false
          expect(absence.comment).to eq 'Received doctor note.'
        end
      end

      context 'multiple rows for different students on the same date' do

        let!(:edwin) { FactoryBot.create(:student, local_id: '1', first_name: 'Edwin') }
        let!(:kristen) { FactoryBot.create(:student, local_id: '2', first_name: 'Kristen') }
        let(:date) { Date.parse('2005-09-16') }

        let(:row_for_edwin) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:row_for_kristen) { { event_date: date, local_id: '2', absence: '1', tardy: '0' } }

        it 'creates an absence for each student' do
          expect {
            attendance_importer.send(:import_row, row_for_edwin)
            attendance_importer.send(:import_row, row_for_kristen)
          }.to change { Absence.count }.by 2
        end
      end

      context 'multiple rows for same student on same date' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }
        let(:date) { Date.parse('2005-09-16') }

        let(:first_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: date, local_id: '1', absence: '1', tardy: '0' } }

        it 'creates an absence' do
          expect {
            attendance_importer.send(:import_row, first_row)
            attendance_importer.send(:import_row, second_row)
          }.to change { Absence.count }.by 1
        end
      end

      context 'multiple rows for same student on different dates' do
        let!(:student) { FactoryBot.create(:student, local_id: '1') }

        let(:first_row) { { event_date: Date.parse('2005-09-14'), local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: Date.parse('2005-09-15'), local_id: '1', absence: '1', tardy: '0' } }
        let(:third_row) { { event_date: Date.parse('2005-09-16'), local_id: '1', absence: '1', tardy: '0' } }
        let(:fourth_row) { { event_date: Date.parse('2005-09-17'), local_id: '1', absence: '1', tardy: '0' } }

        it 'creates multiple absences, but respects end date for time window' do
          expect {
            attendance_importer.send(:import_row, first_row)
            attendance_importer.send(:import_row, second_row)
            attendance_importer.send(:import_row, third_row)
            attendance_importer.send(:import_row, fourth_row)
          }.to change { Absence.count }.by 3
        end
      end
    end

    context 'old attendance events' do
      let(:time_now) { Time.parse('2018-07-16 09:19:53 -0400') }
      let!(:student) { FactoryBot.create(:student, local_id: '1') }
      let(:row) {
        { event_date: Date.parse('2015-09-16'), local_id: '1', absence: '1', tardy: '0' }
      }

      context '--skip_old_records flag on' do
        it 'does not create an absence' do
          expect {
            make_attendance_importer(skip_old_records: true, time_now: time_now).send(:import_row, row)
          }.to change {
            Absence.count
          }.by 0
        end
      end

      context '--skip_old_records flag off' do
        it 'creates an absence' do
          expect {
            make_attendance_importer(time_now: time_now).send(:import_row, row)
          }.to change {
            Absence.count
          }.by 1
        end
      end

    end
  end

  describe '#matching_insights_record_for_row' do
    def matching_insights_record_for_row(row, record_class)
      make_attendance_importer.send(:matching_insights_record_for_row, row, record_class)
    end

    context 'row has student ID' do
      it 'can match on Absence' do
        expect(matching_insights_record_for_row(make_row, Absence)).to be_a Absence
      end

      it 'can match on Tardy' do
        expect(matching_insights_record_for_row(make_row, Tardy)).to be_a Tardy
      end

      it 'returns nil, when the student local_id cannot be matched' do
        row = make_row(local_id: 'cannot-be-found')
        expect(matching_insights_record_for_row(row, Absence)).to eq nil
      end
    end
  end

  describe '#attendance_event_class' do
    def attendance_event_class(row)
      make_attendance_importer.send(:attendance_event_class, row)
    end

    it 'works for absence' do
      expect(attendance_event_class(make_row(absence: 1))).to eq Absence
    end

    it 'works for tardy' do
      expect(attendance_event_class(make_row(tardy: 1))).to eq Tardy
    end

    it 'returns nil if not absence or tardy' do
      expect(attendance_event_class(make_row)).to eq nil
    end

    it 'returns nil if BOTH absence and tardy' do
      expect(attendance_event_class(make_row(absence: 1, tardy: 1))).to eq nil
    end
  end
end
