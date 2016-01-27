require 'rails_helper'

RSpec.describe AttendanceImporter do

  let(:importer) {
    Importer.new(current_file_importer: described_class.new)
  }

  describe '#import_row' do

    context 'realistic data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_attendance_export.txt") }
      let(:local_id_from_file) { '10' }
      let(:date_from_file) { DateTime.parse('2005-09-16') }
      let(:school_year) {
        DateToSchoolYear.new(date_from_file).convert
      }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'student already exists' do
        let(:student) {
          FactoryGirl.create(:student, local_id: local_id_from_file)
        }
        let!(:student_school_year) {
          StudentSchoolYear.create(student: student, school_year: school_year)
        }
        it 'creates one absence' do
          expect {
            importer.start_import(csv)
          }.to change { student_school_year.reload.absences.count }.by(1)
        end
        it 'creates zero tardies' do
          expect {
            importer.start_import(csv)
          }.not_to change { student_school_year.reload.tardies.count }
        end
        it 'assigns the absence occurred_at correctly' do
          importer.start_import(csv)
          expect(student_school_year.reload.absences.last.occurred_at).to eq DateTime.new(2005, 9, 16)
        end
      end

      context 'student does not already exist' do
        it 'creates a new student' do
          expect { importer.start_import(csv) }.to change(Student, :count).by 2
        end
        it 'creates a new student school year' do
          expect { importer.start_import(csv) }.to change(StudentSchoolYear, :count).by 2
        end
        it 'assigns the attendance event to the new student school year' do
          importer.start_import(csv)
          student_school_year = StudentSchoolYear.last.reload
          expect(student_school_year.absences.size).to eq 1
        end
      end

    end
  end
end
