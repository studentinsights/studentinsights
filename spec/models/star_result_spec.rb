require 'rails_helper'

RSpec.describe StarResult, :type => :model do

  describe '#reading_level_warning?' do

    context 'STAR result with reading warning' do
      let(:student) { FactoryGirl.create(:student_behind_in_reading) }
      it 'returns a warning' do
        star_result = student.star_results.last
        expect(star_result.reading_level_warning?).to be true
      end
    end

    context 'STAR result with without reading warning' do
      let(:student) { FactoryGirl.create(:student_ahead_in_reading) }
      it 'does not return a warning' do
        star_result = student.star_results.last
        expect(star_result.reading_level_warning?).to be false
      end
    end
  end
end
