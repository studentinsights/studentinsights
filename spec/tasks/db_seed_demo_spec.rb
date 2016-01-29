require 'rails_helper'

RSpec.describe 'rake db:seed:demo' do

  describe '#create_demo_student' do
    let!(:school) { FactoryGirl.create(:school) }
    let!(:homeroom) { FactoryGirl.create(:homeroom) }

    before do
      InterventionType.seed_somerville_intervention_types
      Assessment.seed_somerville_assessments
    end

    it 'can run without raising an error' do
      expect { create_demo_student(homeroom) }.not_to raise_error
    end
  end

end
