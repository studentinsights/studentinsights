require 'rails_helper'

RSpec.describe StarReadingImporter do

  describe '#import_row' do

    context 'reading file' do

      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_star_reading.csv") }
      let(:transformer) { StarReadingCsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      let(:reading_importer) {
        Importer.new(current_file_importer: described_class.new)
      }

      context 'with good data' do
        context 'existing student' do
          let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
          it 'creates a new student assessment' do
            expect { reading_importer.start_import(csv) }.to change { StudentAssessment.count }.by 1
          end
          it 'creates a new STAR Reading assessment' do
            reading_importer.start_import(csv)
            student_assessment = StudentAssessment.last
            expect(student_assessment.family).to eq "STAR"
            expect(student_assessment.subject).to eq "Reading"
          end
          it 'sets instructional reading level correctly' do
            reading_importer.start_import(csv)
            expect(StudentAssessment.last.instructional_reading_level).to eq 5.0
          end
          it 'sets date taken correctly' do
            reading_importer.start_import(csv)
            expect(StudentAssessment.last.date_taken).to eq Date.new(2015, 1, 21)
          end
          it 'does not create a new student' do
            expect { reading_importer.start_import(csv) }.to change(Student, :count).by 0
          end
        end
        context 'student does not exist' do
          it 'does not create a new student assessment' do
            expect { reading_importer.start_import(csv) }.to change { StudentAssessment.count }.by 0
          end
          it 'does not create a new student' do
            expect { reading_importer.start_import(csv) }.to change(Student, :count).by 0
          end
        end
      end
      context 'with bad data' do
        let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
        let(:transformer) { StarReadingCsvTransformer.new }
        let(:csv) { transformer.transform(file) }
        let(:reading_importer) { StarReadingImporter.new }
        it 'raises an error' do
          expect { reading_importer.start_import(csv) }.to raise_error NoMethodError
        end
      end
    end
  end
end
