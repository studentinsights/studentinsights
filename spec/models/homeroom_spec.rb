require 'rails_helper'

RSpec.describe Homeroom do

  describe '#grade' do
    context 'with PK student' do
      let(:homeroom) { FactoryBot.create(:homeroom_with_pre_k_student) }
      it 'is "PK"' do
        expect(homeroom.grade).to eq "PK"
      end
    end
    context 'with 2nd grade student' do
      let(:homeroom) { FactoryBot.create(:homeroom_with_second_grader) }
      it 'is "2"' do
        expect(homeroom.grade).to eq "2"
      end
    end
  end
  describe '.destroy_empty_homerooms' do
    context 'one homeroom with no students' do
      let!(:homeroom) { FactoryBot.create(:homeroom) }
      it 'deletes the homeroom' do
        expect { Homeroom.destroy_empty_homerooms }.to change(Homeroom, :count).by(-1)
      end
    end
    context 'zero homerooms with no student' do
      let!(:homeroom) { FactoryBot.create(:homeroom_with_student) }
      it 'does nothing' do
        expect { Homeroom.destroy_empty_homerooms }.to change(Homeroom, :count).by 0
      end
    end
  end

end
