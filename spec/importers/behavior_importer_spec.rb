require 'rails_helper'

RSpec.describe BehaviorImporter do

	let(:behavior_importer) { BehaviorImporter.new }

	describe '#parse_row' do
		context 'good data' do
			let(:row) {	{
				state_id: '10',
				incident_code: 'Bullying',
				incident_date: '2015-9-15',
				incident_time: '14:00:00',
				incident_location: 'Hallway',
				incident_description: 'Making fun of another student'
			}	}
			context 'student already exists' do
				let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
				it 'creates discipline incident for the correct student' do
					behavior_importer.parse_row(row)
					expect(student.reload.discipline_incidents.size).to eq 1
				end
				it 'assigns the incident code correctly' do
					behavior_importer.parse_row(row)
					incident = student.reload.discipline_incidents.last
					expect(incident.incident_code).to eq 'Bullying'
				end
				it 'assigns the date correctly' do
					behavior_importer.parse_row(row)
					incident = student.reload.discipline_incidents.last
					expect(incident.incident_date).to eq Date.new(2015, 9, 15)
				end
			end
			context 'student does not already exist' do
				it 'creates a new student' do
					expect {
						behavior_importer.parse_row(row)
					}.to change(Student, :count).by 1
				end
				it 'assigns the attendance event to the new student' do
					behavior_importer.parse_row(row)
					new_student = Student.last.reload
					expect(new_student.discipline_incidents.size).to eq 1
				end
			end
		end
		context 'bad data' do
			let(:row) {	{
				state_id: '10',
				incident_date: 'Hallway',
			}	}
			it 'raises an error' do
				expect{ behavior_importer.parse_row(row) }.to raise_error
			end
		end
	end
end
