require 'rails_helper'

RSpec.describe StarReadingImporter do

  let(:star_reading_importer) {
    described_class.new(options: {
      school_scope: nil, log: nil
    })
  }

  describe '#import_row' do

    context 'reading file' do

      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_star_reading.csv") }
      let(:transformer) { StarReadingCsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      let(:import) { csv.each { |row| star_reading_importer.import_row(row) } }

      context 'with good data' do
        context 'existing student' do
          let!(:student) { FactoryBot.create(:student_we_want_to_update) }
          it 'creates a new student assessment' do
            expect { import }.to change { StudentAssessment.count }.by 1
          end
          it 'creates a new STAR Reading assessment' do
            import
            student_assessment = StudentAssessment.last
            expect(student_assessment.family).to eq "STAR"
            expect(student_assessment.subject).to eq "Reading"
          end
          it 'sets instructional reading level correctly' do
            import
            expect(StudentAssessment.last.instructional_reading_level).to eq 5.0
          end
          it 'sets date taken correctly' do
            import
            expect(StudentAssessment.last.date_taken).to eq Date.new(2015, 1, 21)
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end
        context 'student does not exist' do
          it 'does not create a new student assessment' do
            expect { import }.to change { StudentAssessment.count }.by 0
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end
      end

      context 'with bad data' do
        let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
        let(:transformer) { StarReadingCsvTransformer.new }
        let(:csv) { transformer.transform(file) }
        let(:reading_importer) { star_reading_importer }
        it 'raises an error' do
          expect { import }.to raise_error NoMethodError
        end
      end

    end
  end
end
