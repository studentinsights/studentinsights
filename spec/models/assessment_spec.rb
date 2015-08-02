require 'rails_helper'

RSpec.describe Assessment, :type => :model do
  describe '#assign_to_school_year' do
    context 'has date taken' do
      let(:assessment) { FactoryGirl.create(:assessment) }
      it 'assigns the school year correctly' do
        expect(assessment.school_year).to eq(SchoolYear.find_by_name("2014-2015"))
      end
    end
    context 'does not have date taken' do
      let(:assessment) { FactoryGirl.create(:assessment_without_date_taken) }
      it 'raises an error' do
        expect { assessment.save }.to raise_error NoMethodError
      end
    end
  end
  describe '#risk_level' do
    context 'does not belong to an assessment family' do
      let(:assessment) { FactoryGirl.create(:assessment) }
      it 'returns nil' do
        expect(assessment.risk_level).to be nil
      end
    end
  end
end
