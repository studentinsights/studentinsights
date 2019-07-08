require 'rails_helper'

RSpec.describe MegaReadingProcessor do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/reading/reading_processor.csv")
  end

  describe 'integration test' do
    it 'works on happy path' do
      pals = TestPals.create!
      # benchmark_date = Date.parse('2018/12/19')
      # matcher = ImportMatcher.new
      importer = MegaReadingProcessor.new(pals.uri.id, header_rows_count: 2)
      puts importer.process(fixture_file_text)

      expect(f_and_ps.size).to eq 1
      expect(ReadingProcessor.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "student_id"=>pals.healey_kindergarten_student.id,
        "benchmark_date"=>benchmark_date,
        "instructional_level"=>"A",
        "f_and_p_code"=>"WC",
        "uploaded_by_educator_id"=>pals.uri.id
      }])
      expect(matcher.stats[:valid_rows_count]).to eq 1
      expect(matcher.stats[:invalid_rows_count]).to eq 0
    end
  end
end