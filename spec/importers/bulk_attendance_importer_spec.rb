require 'rails_helper'

RSpec.describe BulkAttendanceImporter do
  let(:bulk_attendance_importer) { BulkAttendanceImporter.new }
  describe '#import' do
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
        expect(event.event_date).to eq DateTime.new(2015, 9, 16)
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
