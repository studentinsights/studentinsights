require 'rails_helper'

RSpec.describe School do

  describe '.with_students' do
    subject { School.with_students }

    context 'no schools have students' do
      before { FactoryGirl.create(:school) }
      it 'returns empty array' do
        expect(subject).to eq []
      end
    end

    context 'all schools have students' do
      let!(:healey) { FactoryGirl.create(:healey) }
      let!(:brown) { FactoryGirl.create(:brown) }
      before { FactoryGirl.create(:student, school: healey) }
      before { FactoryGirl.create(:student, school: brown) }
      it 'returns all schools' do
        expect(subject).to eq [healey, brown]
      end
    end

    context 'some schools have students' do
      let!(:healey) { FactoryGirl.create(:healey) }
      let!(:brown) { FactoryGirl.create(:brown) }
      before { FactoryGirl.create(:student, school: healey) }
      it 'returns the correct schools' do
        expect(subject).to eq [healey]
      end
    end
  end

end
