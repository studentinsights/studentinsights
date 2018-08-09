require 'rails_helper'

RSpec.describe X2AssessmentImporter do
  before { Assessment.seed_for_all_districts }

  def make_x2_assessment_importer(options = {})
    X2AssessmentImporter.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    }.merge(options))
  end

  def mock_importer_with_csv(importer, filename)
    csv = test_csv_from_file(filename)
    allow(importer).to receive(:download_csv).and_return(csv)
    importer
  end

  def test_csv_from_file(filename)
    file = File.read(filename)
    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new)
    transformer.transform(file)
  end

  describe '#import' do
    context 'respects skip_old_records' do
      let!(:student) { FactoryBot.create(:student, local_id: '100') }
      let(:healey) { School.where(local_id: "HEA").first_or_create! }
      let(:csv) { test_csv_from_file("#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }

      it 'skips older records' do
        log = LogHelper::FakeLog.new
        importer = X2AssessmentImporter.new(options: {
          school_scope: nil,
          log: log,
          skip_old_records: true,
          time_now: Time.parse('2014-06-12')
        })
        allow(importer).to receive(:download_csv).and_return(csv)
        importer.import

        expect(log.output).to include('skipped_old_rows_count: 3')
        expect(log.output).to include('created_rows_count: 3')
        expect(StudentAssessment.count).to eq(3)
      end
    end

    context 'with good data and no Assessment records in the database' do
      let(:csv) { test_csv_from_file() }

      context 'for Healey school' do

        let!(:student) { FactoryBot.create(:student, local_id: '100') }
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:log) { LogHelper::FakeLog.new }
        let(:importer) { make_x2_assessment_importer(log: log) }
        before { mock_importer_with_csv(importer, "#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }
        before { importer.import }

        it 'imports only white-listed assessments and logs all assessment types' do
          expect(StudentAssessment.count).to eq 5
          expect(DibelsResult.count).to eq 1
          expect(log.output).to include 'skipped_because_of_test_type: 2'
          expect(log.output).to include '@encountered_test_names_count_map'
          expect(log.output).to include '"MCAS"=>2'
          expect(log.output).to include '"MAP: Reading 2-5 Common Core 2010 V2"=>1'
          expect(log.output).to include '"GRADE"=>1'
          expect(log.output).to include '"WIDA-ACCESS"=>2'
          expect(log.output).to include '"ACCESS"=>1'
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
          it 'creates the correct DIBELS record' do
            expect(DibelsResult.count).to eq 1
            expect(DibelsResult.last.benchmark).to eq 'STRATEGIC'
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
