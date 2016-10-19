require 'rails_helper'

RSpec.describe EventNote, type: :model do

  context 'is_restricted defined' do
    let(:note) { FactoryGirl.build(:event_note, is_restricted: true) }
    it 'is valid' do
      expect(note).to be_valid
    end
  end

  context 'is_restricted undefined' do
    let(:note) { FactoryGirl.build(:event_note) }
    it 'is invalid' do
      expect(note).to be_invalid
    end
  end

end
