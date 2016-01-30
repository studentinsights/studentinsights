require 'rails_helper'

RSpec.describe 'rake db:seed:demo' do

  describe '#create_demo_student' do
    let!(:school) { FactoryGirl.create(:school) }
    let!(:homeroom) { FactoryGirl.create(:homeroom) }

    before do
      InterventionType.seed_somerville_intervention_types
      Assessment.seed_somerville_assessments
    end

    let(:student) { FakeStudent.new(homeroom).student }

    it 'sets student name' do
      expect(student.first_name).not_to be_nil
      expect(student.last_name).not_to be_nil
    end

    it 'sets student langauge attributes' do
      expect(student.limited_english_proficiency).not_to be_nil
      expect(student.home_language).not_to be_nil
    end

    it 'adds student assessments' do
      expect(student.student_assessments).not_to be_empty
    end

  end

end
