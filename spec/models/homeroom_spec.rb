require 'rails_helper'

RSpec.describe Homeroom do
  describe '#grade' do
    context 'with no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_student) }
      it 'is nil' do
        expect(homeroom.grade).to be nil
      end
    end
    context 'with PK student' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_pre_k_student) }
      it 'is zero' do
        expect(homeroom.grade).to be 0
      end
    end
    context 'with 2nd grade student' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_second_grader) }
      it 'is 2' do
        expect(homeroom.grade).to be 2
      end
    end
  end
end
