require 'rails_helper'

RSpec.describe McasRow do

  context 'integration test for Bedford' do
    let!(:pals) { TestPals.create! }

    before do
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
      Assessment.seed_for_all_districts
    end

    it 'works for happy path test case' do
      row = {
        local_id: pals.shs_freshman_mari.local_id,
        assessment_test: 'Gr 10 Math',
        assessment_subject: 'Math',
        assessment_name: 'Gr 10 Math',
        assessment_date: '5/15/2018',
        assessment_scale_score: '239.0',
        assessment_performance_level: 'NI',
        assessment_growth: '31.0'
      }
      record = McasRow.new(row, pals.shs_freshman_mari.id, Assessment.all.to_a).build
      record.save!
      expect(StudentAssessment.count).to eq 1
      expect(record.assessment.family).to eq 'MCAS'
      expect(record.assessment.subject).to eq 'Mathematics'
      expect(record.as_json(except: [:created_at, :updated_at])).to include({
        'id' => a_kind_of(Integer),
        'assessment_id' => a_kind_of(Integer),
        'student_id' => pals.shs_freshman_mari.id,
        'date_taken' => Time.zone.local(2018, 5, 15),
        'instructional_reading_level' => nil,
        'percentile_rank' => nil,
        'grade_equivalent' => nil,
        'scale_score' => 239,
        'performance_level' => 'NI',
        'growth_percentile' => 31
      })
    end
  end

  context 'with no Assessment records in the database' do
    before { Assessment.seed_for_all_districts }
    let(:student) { FactoryBot.create(:student) }

    context 'invalid subject (i.e. not used in Student Insights)' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Technology',
          assessment_name: 'MCAS 2016 Technology',
          local_id: student.local_id,
          assessment_date: Date.today.strftime('%Y-%m-%d')
        }
      }

      it 'does not create a student assessment record and returns nil' do
        expect(McasRow.new(row, student.id, Assessment.all.to_a).build).to eq nil
        expect(StudentAssessment.count).to eq 0
      end
    end

    context 'MCAS Mathematics' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Mathematics',
          assessment_name: 'MCAS 2016 Mathematics',
          local_id: student.local_id,
          assessment_date: Date.today.strftime('%Y-%m-%d')
        }
      }

      context 'when the Assessment family already exists' do
        let!(:assessment) { Assessment.where(family: 'MCAS', subject: 'Mathematics').first }

        it 'returns a saveable student assessment record' do
          McasRow.new(row, student.id, Assessment.all.to_a).build.save!
          expect(StudentAssessment.count).to eq 1
        end
      end
    end

    context 'MCAS English Language Arts, when the ELA Assessment does not yet exist' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Arts',
          assessment_name: 'MCAS 2016 English Language Arts',
          local_id: student.local_id,
          assessment_date: Date.today.strftime('%Y-%m-%d')
        }
      }

      it 'returns a saveable student assessment record' do
        McasRow.new(row, student.id, Assessment.all.to_a).build.save!
        expect(StudentAssessment.count).to eq 1
      end
    end

    context 'Next Gen MCAS' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Arts',
          assessment_name: 'MCAS 2016 English Language Arts',
          local_id: student.local_id,
          assessment_date: Date.today.strftime('%Y-%m-%d'),
          assessment_scale_score: "550.0"
        }
      }

      before { McasRow.new(row, student.id, Assessment.all.to_a).build.save! }

      let(:student_assessment) { StudentAssessment.last }

      let(:assessment_family) { student_assessment.assessment.family }

      it 'assigns the correct "Next Gen" assessment family' do
        expect(assessment_family).to eq 'Next Gen MCAS'
      end
    end

  end
end
