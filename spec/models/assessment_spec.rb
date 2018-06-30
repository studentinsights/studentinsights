require 'rails_helper'

RSpec.describe Assessment, type: :model do

  it 'validates family' do
    expect(FactoryBot.build(:assessment, family: 'foo')).to be_invalid
  end

  context 'MCAS' do
    context 'valid subject' do
      let(:assessment) { FactoryBot.build(:assessment, family: 'MCAS', subject: 'Mathematics') }
      it 'is valid' do
        expect(assessment).to be_valid
      end
    end
    context 'invalid subject' do
      let(:assessment) { FactoryBot.build(:assessment, family: 'MCAS', subject: 'Math') }
      it 'is invalid' do
        expect(assessment).to be_invalid
      end
    end
  end

  context 'STAR' do
    context 'valid subject' do
      let(:assessment) { FactoryBot.build(:assessment, family: 'STAR', subject: 'Mathematics') }
      it 'is valid' do
        expect(assessment).to be_valid
      end
    end
    context 'invalid subject' do
      let(:assessment) { FactoryBot.build(:assessment, family: 'STAR', subject: 'Math') }
      it 'is invalid' do
        expect(assessment).to be_invalid
      end
    end
  end

end
