 require 'rails_helper'

RSpec.describe BulkAttendanceImporter do
  let(:bulk_attendance_importer) { BulkAttendanceImporter.new }
  describe '#import' do
    context 'json' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/kipp_nj_fixtures/fake_att.json").read }
      let(:transformer) { JsonTransformer.new }
      let(:json) { transformer.transform(file) }
      context 'mixed good & bad rows' do
        it 'imports two valid attendance events, drops two non-valid events' do
          bulk_attendance_importer.import(json)
          expect(AttendanceEvent.count).to eq 2
        end
        it 'sets the absence/tardy results correctly' do
          bulk_attendance_importer.import(json)
          absences = AttendanceEvent.where(absence: true)
          tardies = AttendanceEvent.where(tardy: true)
          expect(absences.count).to eq 2
          expect(tardies.count).to eq 0
        end
        it 'sets the date correctly' do
          bulk_attendance_importer.import(json)
          expect(AttendanceEvent.last.event_date).to eq DateTime.new(2014, 8, 11)
        end
      end
    end
    context 'csv' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_attendance_export.txt") }
      let(:transformer) { X2ExportCsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      context 'mixed good & bad rows' do
        it 'imports two valid attendance rows' do
          bulk_attendance_importer.import(csv)
          expect(AttendanceEvent.count).to eq 2
        end
        it 'sets the dates correctly' do
          bulk_attendance_importer.import(csv)
          event = AttendanceEvent.last
          expect(event.event_date).to eq DateTime.new(2005, 9, 16)
        end
        context 'existing student' do
          let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
          it 'assigns correct row to existing student' do
            bulk_attendance_importer.import(csv)
            expect(student.attendance_events.count).to eq 1
          end
          it 'sets the absence/tardy values correctly' do
            bulk_attendance_importer.import(csv)
            event = student.attendance_events.last
            expect(event.absence).to be true
          end
        end
        context 'missing students' do
          it 'creates new students' do
            bulk_attendance_importer.import(csv)
            expect(Student.count).to eq 2
          end
        end
      end
    end
  end
end
