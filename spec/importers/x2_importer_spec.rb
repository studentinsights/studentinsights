require 'rails_helper'

RSpec.describe do

  let!(:x2_student_import_class) {
    Class.new do
      include X2Importer
      def import_row(row)
        Student.where(state_id: row[:state_id]).first_or_create!
      end
    end
  }

  describe '#import' do
    context 'students' do
      let(:x2_importer) { x2_student_import_class.new }

      before(:each) do
        allow(x2_importer).to receive(:count_number_of_rows).with(file).and_return 2
      end

      context 'with good data' do
        let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_students_export.txt") }
        context 'not scoped to healey school' do
          it 'returns a csv' do
            expect(x2_importer.import(file)).to be_a CSV
          end
          it 'sets the headers correctly' do
            headers = x2_importer.import(file).headers
            expect(headers).to eq [:state_id, :local_id, :full_name, :home_language, :program_assigned,
              :limited_english_proficiency, :sped_placement, :disability, :sped_level_of_need, :plan_504,
              :student_address, :grade, :registration_date, :free_reduced_lunch, :homeroom, :school_local_id]
          end
          it 'imports two Somerville High School students' do
            expect { x2_importer.import(file) }.to change(Student, :count).by 2
          end
        end
        context 'scoped to healey school' do
          let(:healey_school) { FactoryGirl.create(:healey) }
          let(:x2_importer) { x2_student_import_class.new(school: healey_school) }
          it 'does not import Somerville High School students' do
            expect { x2_importer.import(file) }.to change(Student, :count).by 0
          end
        end
      end
    end
  end
end
