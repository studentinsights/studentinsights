require 'rails_helper'

RSpec.describe CsvTransformer do

  describe '#transform' do
    context 'with good data' do
      context 'headers in csv' do
        # Return a File.read string just like the CsvDownloader class does:
        let!(:file) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }

        let(:transformer) { CsvTransformer.new }
        let(:output) { transformer.transform(file) }
        it 'returns a CSV' do
          expect(output).to be_a_kind_of CSV::Table
        end
        it 'has the correct headers' do
          expect(output.headers).to match_array([
            :event_date, :incident_code, :incident_description, :incident_location, :incident_time, :local_id, :school_local_id
          ])
        end
      end
    end
  end
end
