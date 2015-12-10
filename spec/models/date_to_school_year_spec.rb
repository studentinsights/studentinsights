require 'rails_helper'

RSpec.describe describe DateToSchoolYear do
  describe '#convert' do
    let(:converter) { DateToSchoolYear.new(date) }
    context 'month falls in first half of school year' do
      let(:date) { Date.new(2015, 9, 1) }
      it 'creates a new school year object' do
        expect { converter.convert }.to change(SchoolYear, :count).by 1
      end
      it 'sets the school year name correctly' do
        converter.convert
        expect(SchoolYear.last.reload.name).to eq '2015-2016'
      end
    end
    context 'month falls in second half of school year' do
      let(:date) { Date.new(2015, 3, 28) }
      it 'creates a new school year object' do
        expect { converter.convert }.to change(SchoolYear, :count).by 1
      end
      it 'sets the school year name correctly' do
        converter.convert
        expect(SchoolYear.last.reload.name).to eq '2014-2015'
      end
    end
  end
end
