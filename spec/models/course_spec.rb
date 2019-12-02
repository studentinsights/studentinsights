require 'rails_helper'

RSpec.describe Course, type: :model do

  context 'valid course' do
    it 'is valid' do
      expect(FactoryBot.create(:course)).to be_valid
    end
  end
end
