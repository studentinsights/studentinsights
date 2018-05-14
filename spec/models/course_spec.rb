require 'rails_helper'

RSpec.describe Course, type: :model do

  context 'valid course' do
    let(:course) { FactoryBot.build(:course)}

    it 'is valid' do
      expect(course).to be_valid
    end
  end
end
