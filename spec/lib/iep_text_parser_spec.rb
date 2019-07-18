require 'spec_helper'

RSpec.describe IepTextParser do
  describe 'cleaned_text' do
    it 'cleans extra space' do
      expect(IepTextParser.new('     IEP     with extra space   ').cleaned_text).to eq('IEP with extra space')
    end

    it 'unhyphenates' do
      expect(IepTextParser.new("This is an in-\nteresting thing.").cleaned_text).to eq('This is an interesting thing.')
    end

    it 'removes indent after forced newline' do
      expect(IepTextParser.new("Mariah\n  loves painting.").cleaned_text).to eq("Mariah\nloves painting.")
    end
  end

  describe 'any_grid?' do
    it 'works' do
      expect(IepTextParser.new('... Grid A...').any_grid?).to eq(true)
      expect(IepTextParser.new('... Service Delivery...').any_grid?).to eq(true)
      expect(IepTextParser.new('... Services ...').any_grid?).to eq(false)
    end
  end

  describe 'match_dates' do
    it 'works' do
      expect(IepTextParser.new('... IEP Dates: 12/19/2006 - 12/18/2007 ...').match_dates).to eq(["12/19/2006", "12/18/2007"])
      expect(IepTextParser.new('... IEP Dates:12/19/2006-12/18/2007 ...').match_dates).to eq(["12/19/2006", "12/18/2007"])
      expect(IepTextParser.new('... For IEP from 12/19/2006 to 12/18/2007 ...').match_dates).to eq(["12/19/2006", "12/18/2007"])
      expect(IepTextParser.new('... IEP Begin Date: 12/19/2006 IEP End Date: 12/18/2007 Parent and student concerns...').match_dates).to eq(["12/19/2006", "12/18/2007"])
    end

    it 'tolerates no leading zeros' do
      expect(IepTextParser.new('... For IEP from 3/4/2006 to 3/3/2007 ...').match_dates).to eq(['3/4/2006', '3/3/2007'])
    end

    it 'returns nil on inconsistencies within the document' do
      expect(IepTextParser.new([
        '... IEP Dates: 12/19/2006 - 12/18/2007 ...',
        '... For IEP from 03/04/2006 to 03/03/2007 ...'
      ].join("\n")).match_dates).to eq(nil)
    end
  end
end
