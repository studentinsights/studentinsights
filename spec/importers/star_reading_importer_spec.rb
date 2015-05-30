require 'rails_helper'

RSpec.describe StarReadingImporter do
	describe '#import_row' do
		context 'reading file' do
			let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_star_reading.csv") }
			let(:reading_importer) { StarReadingImporter.new }
			context 'with good data' do
				it 'creates a new STAR result' do
					expect { reading_importer.import(file) }.to change(StarResult, :count).by 1
				end
				it 'sets the result correctly' do
					reading_importer.import(file)
					expect(StarResult.last.instructional_reading_level).to eq 5.0
				end
				context 'existing student' do
					let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
					it 'does not create a new student' do
						expect { reading_importer.import(file) }.to change(Student, :count).by 0
					end
				end
				context 'new student' do
					it 'creates a new student object' do
						expect { reading_importer.import(file) }.to change(Student, :count).by 1
					end
				end
			end
			context 'with bad data' do
				let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
				let(:reading_importer) { StarReadingImporter.new }
				it 'raises an error' do
					expect { reading_importer.import(file) }.to raise_error
				end
			end
		end
	end
end
