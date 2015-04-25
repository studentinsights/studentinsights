require 'rails_helper'

RSpec.describe StarImporter do

  describe '#import' do
		let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
		context 'with good data' do
			context 'math results' do
				math_fixture_path = "#{Rails.root}/spec/fixtures/fake_star_math.csv"
				let(:math_importer) { StarImporter.new(math_fixture_path, "math") }
				it 'associates a STAR result with the correct student' do
					math_importer.import
					expect(student.reload.star_results.count).to eq 1
				end
				it 'sets the STAR result correctly' do
					math_importer.import
					star_result = student.star_results.last
					expect(star_result.math_percentile_rank).to eq 70
				end
			end
			context 'reading results' do
				reading_fixture_path = "#{Rails.root}/spec/fixtures/fake_star_reading.csv"
				let(:reading_importer) { StarImporter.new(reading_fixture_path, "reading") }
				it 'associates a STAR result with the correct student' do
					reading_importer.import
					expect(student.reload.star_results.count).to eq 1
				end
				it 'sets the STAR result correctly' do
					reading_importer.import
					star_result = student.star_results.last
					expect(star_result.reading_percentile_rank).to eq 90
					expect(star_result.instructional_reading_level).to eq 5.0
				end
			end
		end
	end
end