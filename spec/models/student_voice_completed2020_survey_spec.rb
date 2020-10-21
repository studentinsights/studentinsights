require 'rails_helper'

RSpec.describe StudentVoiceCompleted2020Survey, type: :model do
  context 'valid course' do
    let(:student_voice_completed2020_survey) { FactoryBot.create(:student_voice_completed2020_survey)}

    it 'is valid' do
      expect(student_voice_completed2020_survey).to be_valid
    end
  end
end
