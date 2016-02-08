require 'rails_helper'

RSpec.describe AttendanceImporter do

  let(:importer) {
    Importer.new(current_file_importer: described_class.new)
  }

  describe '#import_row' do

    context 'realistic data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_attendance_export.txt") }
      let(:date_from_file) { DateTime.parse('2005-09-16') }
      before { FactoryGirl.create(:student, local_id: '11') }
      before { FactoryGirl.create(:student, local_id: '12') }

      let(:student) { FactoryGirl.create(:student, local_id: '10') }

      let(:school_year) {
        DateToSchoolYear.new(date_from_file).convert
      }

      let!(:student_school_year) {
        StudentSchoolYear.create(student: student, school_year: school_year)
      }

      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'student already exists' do
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

    end
  end
end
