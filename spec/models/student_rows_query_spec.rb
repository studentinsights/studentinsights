require 'rails_helper'

RSpec.describe StudentRowsQuery do
  subject(:query_result) { StudentRowsQuery.new(homeroom).to_rows }
  let(:homeroom) { FactoryGirl.create(:homeroom) }
  describe '#student_attribute_rows' do
    context 'homeroom with no students' do
      it 'returns an empty array' do
        expect(query_result).to eq([])
      end
    end
    context 'homeroom with a student' do
      let!(:student) { FactoryGirl.create(:student, homeroom: homeroom) }
      it 'returns an array with one member' do
        expect(query_result).to be_a Array
        expect(query_result.size).to eq 1
      end
      it 'returns the correct student information' do
        first_result = query_result[0]
        expect(first_result).to include "id" => "#{student.id}"
        expect(first_result).to include "program_assigned" => nil
      end
    end
    context 'student with one student assessment' do
      let!(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment, homeroom: homeroom) }
      it 'returns correct student assessment information' do
        first_result = query_result[0]
        expect(first_result['performance_level']).to eq 'W'
      end
    end
    context 'student with student assessments on different dates' do
      let!(:student) { FactoryGirl.create(:student_with_star_math_student_assessments_different_days, homeroom: homeroom) }
      it 'returns information for most recent student assessment' do
        first_result = query_result[0]
        date_taken = DateTime.parse(first_result['date_taken'])
        expect(date_taken).to eq DateTime.new(2015, 6, 20)
      end
    end
    context 'multiple students' do
      let!(:student) { FactoryGirl.create(:student_with_mcas_math_assessment, homeroom: homeroom) }
      let!(:another_student) { FactoryGirl.create(:student_with_mcas_ela_assessment, homeroom: homeroom) }
      it 'returns an array with two student assessments' do
        expect(query_result.size).to eq 2
      end
    end
  end
end
