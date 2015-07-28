require 'rails_helper'

RSpec.describe X2AssessmentImporter do

  describe '#import' do
    context 'with good data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }

      context 'for Healey school' do
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:healey_importer) { X2AssessmentImporter.new(school: healey) }

        it 'creates a student' do
          expect { healey_importer.import(file) }.to change(Student, :count).by 1
        end

        context 'MCAS' do
          let(:assessment_family) { AssessmentFamily.where(name: "MCAS") }

          before(:each) do
            healey_importer.import(file)
          end

          it 'creates assessment family' do
            expect(assessment_family.count).to eq 1
          end
          it 'creates two results' do
            mcas_results = assessment_family.first.assessments
            expect(mcas_results.count).to eq 2
          end
          context 'Math' do
            let(:subject) { AssessmentSubject.where(name: "Math").first }
            it 'sets the scaled scores and performance levels, growth percentiles correctly' do
              mcas_result = Assessment.where(assessment_subject_id: subject.id).last
              expect(mcas_result.scale_score).to eq(214)
              expect(mcas_result.performance_level).to eq('W')
              expect(mcas_result.growth_percentile).to eq(nil)
            end
          end
          context 'ELA' do
            let(:subject) { AssessmentSubject.where(name: "ELA").first }
            it 'sets the scaled scores, performance levels, growth percentiles correctly' do
              mcas_result = Assessment.where(assessment_subject_id: subject.id).last
              expect(mcas_result.scale_score).to eq(222)
              expect(mcas_result.performance_level).to eq('NI')
              expect(mcas_result.growth_percentile).to eq(70)
            end
          end
        end
      end
      context 'with bad data' do
        let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_mcas.csv") }
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:healey_importer) { X2AssessmentImporter.new(school: healey) }
        it 'raises an error' do
          expect { healey_importer.import(file) }.to raise_error ActiveRecord::StatementInvalid
        end
      end
    end
  end
end
