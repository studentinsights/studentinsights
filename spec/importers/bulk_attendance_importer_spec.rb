 require 'rails_helper'

RSpec.describe BulkAttendanceImporter do
  let(:bulk_attendance_importer) { BulkAttendanceImporter.new }
  describe '#import' do

    context 'json' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/kipp_nj_fixtures/fake_att.json").read }

      let(:transformer) { JsonTransformer.new }
      let(:json) { transformer.transform(file) }

      before { FactoryGirl.create(:student, local_id: '1') }
      before { FactoryGirl.create(:student, local_id: '2') }

      context 'mixed good & bad rows' do
        it 'imports the valid absences' do
          expect {
            bulk_attendance_importer.start_import(json)
          }.to change(Absence, :count).by(2)
        end
        it 'does not import any tardies' do
          expect {
            bulk_attendance_importer.start_import(json)
          }.not_to change(Tardy, :count)
        end
      end
    end

    context 'csv' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_attendance_export.txt") }
      let(:local_id_from_file) { '10' }

      let(:date_from_file) { DateTime.parse('2005-09-16') }
      let(:school_year) {
        DateToSchoolYear.new(date_from_file).convert
      }

      let!(:student) {
        FactoryGirl.create(:student, local_id: local_id_from_file)
      }

      before { FactoryGirl.create(:student, local_id: '11') }
      before { FactoryGirl.create(:student, local_id: '12') }

      let(:student_school_year) {
        StudentSchoolYear.create(student: student, school_year: school_year)
      }

      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'mixed good & bad rows' do
        it 'imports two valid attendance rows' do
          expect {
            bulk_attendance_importer.start_import(csv)
          }.to change(Absence, :count).by 2
        end
        it 'assigns absences to the existing student' do
          expect {
            bulk_attendance_importer.start_import(csv)
          }.to change { student_school_year.reload.absences.count }.by(1)
        end
      end

    end
  end
end
