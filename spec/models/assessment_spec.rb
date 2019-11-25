require 'rails_helper'

RSpec.describe Assessment, type: :model do

  it 'validates family' do
    expect { FactoryBot.create(:assessment, family: 'foo') }.to raise_error(ActiveRecord::RecordInvalid)
  end

  context 'MCAS' do
    it 'allows valid' do
      expect(FactoryBot.create(:assessment, family: 'MCAS', subject: 'Mathematics').valid?).to eq true
    end

    it 'fails invalid subject' do
      expect { FactoryBot.create(:assessment, family: 'MCAS', subject: 'Math') }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

end
