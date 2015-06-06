require 'rails_helper'

RSpec.describe StarMathImporter do
	describe '#import_row' do
		context 'math file' do
			let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_star_math.csv") }
			let(:math_importer) { StarMathImporter.new }
			context 'with good data' do
				it 'creates a new STAR result' do
					expect { math_importer.import(file) }.to change(StarResult, :count).by 1
				end
				it 'sets math percentile rank correctly' do
					math_importer.import(file)
					expect(StarResult.last.math_percentile_rank).to eq 70
				end
				it 'sets date taken correctly' do
					math_importer.import(file)
					expect(StarResult.last.date_taken).to eq Date.new(2015, 1, 21)
				end
				context 'existing student' do
					let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
					it 'does not create a new student' do
						expect { math_importer.import(file) }.to change(Student, :count).by 0
					end
				end
				context 'new student' do
					it 'creates a new student object' do
						expect { math_importer.import(file) }.to change(Student, :count).by 1
					end
				end
			end
			context 'with bad data' do
				let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
				let(:math_importer) { StarMathImporter.new }
				it 'raises an error' do
					expect { math_importer.import(file) }.to raise_error
				end
			end
		end
	end
end
