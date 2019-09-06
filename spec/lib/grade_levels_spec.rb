require 'rails_helper'

RSpec.describe GradeLevels do
  describe '.sort' do
    it 'works' do
      expect(GradeLevels.sort(['2', '3', 'KF'])).to eq(['KF', '2', '3'])
      expect(GradeLevels.sort(['2', 'TK', '11', '9', '3', 'KF'])).to eq(['TK', 'KF', '2', '3', '9', '11'])
    end

    it 'puts unknown things last, in order' do
      expect(GradeLevels.sort(['wat', '3', 'wtf', '7th', 'KF'])).to eq(['KF', '3', '7th', 'wat', 'wtf'])
    end
  end
end
