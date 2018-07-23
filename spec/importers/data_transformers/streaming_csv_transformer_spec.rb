require 'rails_helper'

RSpec.describe StreamingCsvTransformer do

  describe '#transform' do
    context 'tracks total and processed rows' do
      let!(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
      let(:transformer) { StreamingCsvTransformer.new(LogHelper::FakeLog.new) }
      let(:output) { transformer.transform(csv_string) }

      it '#stats (before iteration)' do
        expect(transformer.send(:stats)).to eq({
          :processed_rows_count => 0,
          :skipped_dirty_rows_count => 0
        })
      end

      it '#stats (after iteration) filter out row with bad date' do
        output.each_with_index {|row, index| nil }
        expect(transformer.send(:stats)).to eq({
          :processed_rows_count => 3,
          :skipped_dirty_rows_count => 1
        })
      end
    end

    context 'headers in csv' do
      let!(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
      let(:transformer) { StreamingCsvTransformer.new(LogHelper::FakeLog.new) }
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
      let(:transformer) { StreamingCsvTransformer.new(LogHelper::FakeLog.new, headers: headers) }
      let(:output) { transformer.transform(csv_string) }

      it '#each_with_index' do
        rows = []
        output.each_with_index {|row, index| rows << row }
        expect(rows.size).to eq(6)
        expect(rows.first.headers).to match_array(headers.map(&:to_sym))
        expect(transformer.send(:stats)).to eq({
          :processed_rows_count => 6,
          :skipped_dirty_rows_count => 0
        })
      end
    end
  end
end
