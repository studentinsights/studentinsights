require 'rails_helper'

RSpec.describe CsvTransformer do

  describe '#transform' do
    context 'tracks total and processed rows' do
      let!(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
      let(:transformer) { CsvTransformer.new }

      it '#size and #pre_cleanup_csv_size filter out row with bad date' do
        output = transformer.transform(csv_string)
        expect(transformer.pre_cleanup_csv_size).to eq 4
        expect(output.size).to eq 3
      end
    end

    context 'headers in csv' do
      let!(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
      let(:transformer) { CsvTransformer.new }
      let(:output) { transformer.transform(csv_string) }

      it '#each_with_index' do
        rows = []
        output.each_with_index {|row, index| rows << row }

        expect(rows.size).to eq(3)
        expect(rows.first.to_hash).to eq({
          local_id: '10',
          incident_code: 'Hitting',
          event_date: Date.parse('2015-10-01'),
          incident_time: '13:00:00',
          incident_location: 'Classroom',
          incident_description: 'Hit another student.',
          school_local_id: 'SHS'
        })
        expect(rows.first.headers).to match_array([
          :event_date, :incident_code, :incident_description, :incident_location, :incident_time, :local_id, :school_local_id
        ])
      end
    end

    context 'headers not in csv' do
      let!(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_no_headers.csv") }
      let(:headers) {["section_number","student_local_id","school_local_id","course_number","term_local_id","grade"]}
      let(:transformer) { CsvTransformer.new(headers: headers) }
      let(:output) { transformer.transform(csv_string) }

      it '#size' do
        expect(output.size).to eq 6
      end

      it '#each_with_index' do
        rows = []
        output.each_with_index {|row, index| rows << row }
        expect(rows.size).to eq(6)
        expect(rows.first.headers).to match_array(headers.map(&:to_sym))
      end
    end
  end
end
