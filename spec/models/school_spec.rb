require 'rails_helper'

RSpec.describe School do

  describe '.with_students' do
    subject { School.with_students }

    context 'no schools have students' do
      before { FactoryBot.create(:school) }
      it 'returns empty array' do
        expect(subject).to eq []
      end
    end

    context 'all schools have students' do
      let!(:healey) { FactoryBot.create(:healey) }
      let!(:brown) { FactoryBot.create(:brown) }
      before { FactoryBot.create(:student, school: healey) }
      before { FactoryBot.create(:student, school: brown) }
      it 'returns all schools' do
        expect(subject).to contain_exactly(healey, brown)
      end
    end

    context 'some schools have students' do
      let!(:healey) { FactoryBot.create(:healey) }
      let!(:brown) { FactoryBot.create(:brown) }
      before { FactoryBot.create(:student, school: healey) }
      it 'returns the correct schools' do
        expect(subject).to eq([healey])
      end
    end
  end

end
