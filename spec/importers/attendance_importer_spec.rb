require 'rails_helper'

RSpec.describe AttendanceImporter do

  let(:importer) {
    Importer.new(current_file_importer: described_class.new)
  }

  let(:import) { importer.start_import(csv) }

  describe '#import_row' do

    context 'realistic data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_attendance_export.txt") }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'student already exists' do
        let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
        it 'creates attendence event for the correct student' do
          import
          expect(student.reload.attendance_events.size).to eq 1
        end
        it 'assigns absence correctly' do
          import
          expect(student.reload.attendance_events.last.absence?).to be true
        end
        it 'assigns tardiness correctly' do
          import
          expect(student.reload.attendance_events.last.tardy?).to be false
        end
        it 'assigns the date correctly' do
          import
          event_date = student.reload.attendance_events.last.event_date
          expect(event_date).to eq DateTime.new(2005, 9, 16)
        end
      end

      context 'student does not already exist' do
        it 'creates a new student' do
          expect { import }.to change(Student, :count).by 2
        end
        it 'assigns the attendance event to the new student' do
          import
          new_student = Student.last.reload
          expect(new_student.attendance_events.size).to eq 1
        end
      end

    end
  end
end
