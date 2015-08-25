require 'rails_helper'

RSpec.describe StudentRowsQuery do
  subject(:query) { StudentRowsQuery.new(homeroom) }
  let(:homeroom) { FactoryGirl.create(:homeroom) }
  describe '#student_attribute_rows' do
    context 'homeroom with no students' do
      it 'returns an empty array' do
        expect(query.student_attribute_rows).to eq([])
      end
    end
    context 'homeroom with a student' do
      let!(:student) { FactoryGirl.create(:student, homeroom: homeroom) }
      it 'returns an array with one member' do
        expect(query.student_attribute_rows).to be_a Array
        expect(query.student_attribute_rows.size).to eq 1
      end
      it 'returns the correct student information' do
        student_attributes = query.student_attribute_rows[0]
        expect(student_attributes).to include "student_id" => "#{student.id}"
        expect(student_attributes).to include "program_assigned" => nil
      end
    end
  end
  describe '#student_assessment_rows' do
    context 'student with no student assessments' do
      let!(:student) { FactoryGirl.create(:student, homeroom: homeroom) }
      it 'returns an empty array' do
        expect(query.student_assessment_rows).to eq([])
      end
    end
    context 'student with one student assessment' do
      let!(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment, homeroom: homeroom) }
      it 'returns correct student assessment information' do
        student_assessment = query.student_assessment_rows[0]
        expect(student_assessment['performance_level']).to eq 'W'
      end
    end
    context 'student with student assessments on different dates' do
      let!(:student) { FactoryGirl.create(:student_with_star_math_and_star_reading_different_days, homeroom: homeroom) }
      it 'returns information for most recent student assessment' do
        student_assessment = query.student_assessment_rows[0]
        date_taken = DateTime.parse(student_assessment['date_taken'])
        expect(date_taken).to eq DateTime.new(2015, 6, 20)
      end
    end
    context 'multiple students' do
      let!(:student) { FactoryGirl.create(:student_with_mcas_math_assessment, homeroom: homeroom) }
      let!(:another_student) { FactoryGirl.create(:student_with_mcas_ela_assessment, homeroom: homeroom) }
      it 'returns an array with two student assessments' do
        expect(query.student_assessment_rows.size).to eq 2
      end
    end
  end
end
