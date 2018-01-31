require 'rails_helper'

RSpec.describe StarMathImporter do

  let(:star_math_importer) {
    described_class.new(options: {
      school_scope: nil, log: nil
    })
  }

  describe '#import_row' do

    context 'math file' do

      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_star_math.csv") }
      let(:transformer) { StarMathCsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      let(:import) { csv.each { |row| star_math_importer.import_row(row) } }

      context 'with good data' do

        context 'existing student' do
          let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
          it 'creates a new student assessment' do
            expect { import }.to change { StudentAssessment.count }.by 1
          end
          it 'creates a new STAR MATH assessment' do
            import
            student_assessment = StudentAssessment.last
            assessment = student_assessment.assessment
            expect(assessment.family).to eq "STAR"
            expect(assessment.subject).to eq "Mathematics"
          end
          it 'sets math percentile rank correctly' do
            import
            expect(StudentAssessment.last.percentile_rank).to eq 70
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
        let(:transformer) { StarMathCsvTransformer.new }
        let(:csv) { transformer.transform(file) }
        it 'raises an error' do
          expect { import }.to raise_error NoMethodError
        end
      end
    end
  end
end
