require 'rails_helper'

RSpec.describe X2AssessmentImporter do

  let(:x2_assessment_importer) {
    described_class.new(options: {
      school_scope: nil, log: nil
    })
  }

  describe '#import' do
    context 'with good data and no Assessment records in the database' do
      before { Assessment.destroy_all }
      after { Assessment.seed_somerville_assessments }

      let(:file) { File.read("#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'for Healey school' do

        let!(:student) { FactoryGirl.create(:student, local_id: '100') }
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:importer) { described_class.new }
        before { csv.each { |row| x2_assessment_importer.import_row(row) }}

        it 'imports only white-listed assessments' do
          expect(StudentAssessment.count).to eq 6
        end

        context 'MCAS' do
          let(:assessments) { Assessment.where(family: "MCAS") }

          it 'creates MCAS Mathematics and ELA assessments' do
            expect(assessments.count).to eq 2
            expect(assessments.map(&:subject)).to contain_exactly 'ELA' , 'Mathematics'
          end
          context 'Math' do
            it 'sets the scaled scores and performance levels, growth percentiles correctly' do
              mcas_assessment = Assessment.find_by_family_and_subject('MCAS', 'Mathematics')
              mcas_student_assessment = mcas_assessment.student_assessments.last
              expect(mcas_student_assessment.scale_score).to eq(214)
              expect(mcas_student_assessment.performance_level).to eq('W')
              expect(mcas_student_assessment.growth_percentile).to eq(nil)
            end
          end
          context 'ELA' do
            it 'sets the scaled scores, performance levels, growth percentiles correctly' do
              mcas_assessment = assessments.where(subject: "ELA").first
              mcas_student_assessment = mcas_assessment.student_assessments.last
              expect(mcas_student_assessment.scale_score).to eq(222)
              expect(mcas_student_assessment.performance_level).to eq('NI')
              expect(mcas_student_assessment.growth_percentile).to eq(70)
            end
          end
        end

        context 'DIBELS' do
          let(:assessments) { Assessment.where(family: "DIBELS") }
          let(:assessment) { assessments.first }

          it 'creates assessment' do
            expect(assessments.count).to eq 1
          end
          it 'creates a student assessment' do
            results = assessment.student_assessments
            expect(results.count).to eq 1
          end
          it 'sets the performance levels correctly' do
            dibels_result = assessment.student_assessments.last
            expect(dibels_result.performance_level).to eq('Benchmark')
          end
        end

        context 'ACCESS' do
          let(:assessments) { Assessment.where(family: "ACCESS", subject: "Composite") }
          let(:assessment) { assessments.first }

          it 'creates assessment' do
            expect(assessments.count).to eq 1
          end
          it 'creates three student assessments' do
            results = assessment.student_assessments
            expect(results.count).to eq 3
          end
          it 'sets the scaled scores, performance levels, growth percentiles correctly' do
            last_access_result = assessment.student_assessments.last
            expect(last_access_result.scale_score).to eq(367)
            expect(last_access_result.performance_level).to eq('4.9')
            expect(last_access_result.growth_percentile).to eq(92)
          end
        end
      end
    end
  end
end
