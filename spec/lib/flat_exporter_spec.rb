require 'rails_helper'

RSpec.describe FlatExporter do
  let!(:pals) { TestPals.create! }

  describe '#csv_string' do
    it 'generates a CSV with flattened field names' do
      json = [
        { id: '42', name: { first: 'kevin', last: 'youkilis'} }
      ]
      csv_string = FlatExporter.new.csv_string(json)
      expect(csv_string).to eq([
        'id,name.first,name.last',
        '42,kevin,youkilis',
        ''
      ].join("\n"))
    end
  end
end
