require 'rails_helper'

RSpec.describe AttendanceImporter do

  def make_attendance_importer(options = {})
    importer = AttendanceImporter.new(options: {
      school_scope: nil,
      log: nil,
      skip_old_records: false
    }.merge(options))
    importer
  end

  def make_row(hash = {})
    {
      local_id: FactoryBot.create(:student).local_id,
      event_date: Date.parse('1981-12-30'),
    }.merge(hash)
  end

  describe '#import, end-to-end' do
    let!(:pals) { TestPals.create! }

    it 'works on happy path to import an Absence record' do
      log = LogHelper::FakeLog.new
      file_text = [
        '"event_date","local_id","absence","tardy","dismissed","reason","excused","comment"',
        '"2005-09-16","111222222",1,0,0,"Medical",0,"Received doctor note."'
      ].join("\n")
      csv = StreamingCsvTransformer.from_text(log, file_text, {
        csv_options: { header_converters: :symbol }
      })

      importer = make_attendance_importer({
        time_now: pals.time_now,
        log: log
      })
      allow(importer).to receive(:download_csv).and_return(csv)
      importer.import
      expect(importer.stats).to eq({
        :skipped_from_school_filter => 0,
        :skipped_from_student_local_id_filter => 0,
        :skipped_old_rows_count => 0,
        :skipped_other_rows_count => 0,
        :student_local_id_not_found_count => 0,
        :absence_record_syncer => {
          :total_sync_calls_count=>1,
          :passed_nil_record_count=>0,
          :invalid_rows_count=>0,
          :validation_failure_counts_by_field=>{},
          :updated_rows_count=>0,
          :created_rows_count=>1,
          :destroyed_records_count=>0,
          :unchanged_rows_count=>0,
          :has_processed_unmarked_records=>true,
          :marked_ids_count=>1
        },
        :tardy_record_syncer => {
          :total_sync_calls_count=>0,
          :passed_nil_record_count=>0,
          :invalid_rows_count=>0,
          :validation_failure_counts_by_field=>{},
          :updated_rows_count=>0,
          :created_rows_count=>0,
          :destroyed_records_count=>0,
          :unchanged_rows_count=>0,
          :has_processed_unmarked_records=>true,
          :marked_ids_count=>0
        }
      })
      expect(Tardy.all.size).to eq 0
      expect(Absence.all.size).to eq 1
      expect(Absence.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        'student_id' => pals.shs_freshman_mari.id,
        'occurred_at' => Date.parse('Fri, 16 Sep 2005'),
        'dismissed' => false,
        'excused' => false,
        'reason' => 'Medical',
        'comment' => 'Received doctor note.'
      }])
    end
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

        context "row with both absence and tardy (Somerville)" do
          let(:row) {
            { event_date: date, local_id: '1', absence: '1', tardy: '1',
              dismissed: '0', reason: 'Medical', excused: '0', comment: 'Received doctor note.' }
          }

          it 'creates an absence' do
              expect {
                attendance_importer.send(:import_row, row)
              }.to change {
                Absence.count
              }.by 1
            end

          it 'creates a tardy' do
              expect {
                attendance_importer.send(:import_row, row)
              }.to change {
                Tardy.count
              }.by 1
            end

          it 'sets the right attributes for the absence' do
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

          it 'increments student tadies by 1' do
            expect {
              attendance_importer.send(:import_row, row)
            }.to change {
              student.reload.tardies.size
            }.by 1
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

        let(:first_row) { { event_date: Date.parse('2005-09-13'), local_id: '1', absence: '1', tardy: '0' } }
        let(:second_row) { { event_date: Date.parse('2005-09-15'), local_id: '1', absence: '1', tardy: '0' } }
        let(:third_row) { { event_date: Date.parse('2005-09-17'), local_id: '1', absence: '1', tardy: '0' } }
        let(:fourth_row) { { event_date: Date.parse('2005-09-19'), local_id: '1', absence: '1', tardy: '0' } }

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

  context 'when given unexpected students (eg, from older records)' do
    let(:time_now) { TestPals.new.time_now }

    it 'counts stats on students not matched' do
      log = LogHelper::FakeLog.new
      importer = make_attendance_importer({
        time_now: time_now,
        log: log
      })
      importer.send(:import_row, {
        event_date: Date.parse('2005-09-16'),
        local_id: '999111777333', # not in db
        absence: 'true',
        tardy: 'false',
        dismissed: 'false',
        reason: 'Medical',
        excused: '0',
        comment: 'Received doctor note.'
      })
      expect(importer.stats[:student_local_id_not_found_count]).to eq(1)
      expect(Absence.all.size).to eq 0
    end
  end

  describe '#matching_insights_record_for_row' do
    def matching_insights_record_for_row(row, record_class)
      student_id = Student.find_by_local_id(row[:lodal_id])
      make_attendance_importer.send(:matching_insights_record_for_row, student_id, row, record_class)
    end

    it 'can match on Absence' do
      expect(matching_insights_record_for_row(make_row, Absence)).to be_a Absence
    end

    it 'can match on Tardy' do
      expect(matching_insights_record_for_row(make_row, Tardy)).to be_a Tardy
    end
  end

  describe '#attendance_event_class' do
    def valid_attendance_event_classes(row)
      make_attendance_importer.send(:valid_attendance_event_classes, row)
    end

    it 'works for absence' do
      expect(valid_attendance_event_classes(make_row(absence: 1))).to eq [Absence]
    end

    it 'works for tardy' do
      expect(valid_attendance_event_classes(make_row(tardy: 1))).to eq [Tardy]
    end

    it 'returns nil if not absence or tardy' do
      expect(valid_attendance_event_classes(make_row)).to eq []
    end

    it 'returns both if BOTH absence and tardy' do
      expect(valid_attendance_event_classes(make_row(absence: 1, tardy: 1))).to eq [Absence, Tardy]
    end
  end
end
