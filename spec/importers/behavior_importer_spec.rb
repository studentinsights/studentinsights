require 'rails_helper'

RSpec.describe BehaviorImporter do

	let(:behavior_importer) { BehaviorImporter.new }

	describe '#parse_row' do
		context 'good data' do
			let!(:row) {	{
				state_id: '10',
				incident_code: 'Bullying',
				event_date: '2015-9-15',
				incident_time: '09:33:00',
				incident_location: 'Hallway',
				incident_description: 'Making fun of another student'
			}	}
			let(:import) { behavior_importer.parse_row(row) }

			context 'data includes time' do
				context 'student already exists' do
					let!(:student) { FactoryGirl.create(:student_we_want_to_update) }

					before do |example|
						import unless example.metadata[:skip_before]
		      end

					it 'creates a new discipline incident', skip_before: true do
						expect { import }.to change(DisciplineIncident, :count).by 1
					end
					it 'creates discipline incident for the correct student' do
						expect(student.reload.discipline_incidents.size).to eq 1
					end
					it 'assigns the incident code correctly' do
						incident = student.reload.discipline_incidents.last
						expect(incident.incident_code).to eq 'Bullying'
					end
					it 'assigns the date correctly' do
						incident = student.reload.discipline_incidents.last
						expect(incident.event_date).to eq DateTime.new(2015, 9, 15, 9, 33)
					end
					it 'sets has exact time to true' do
						incident = student.reload.discipline_incidents.last
						expect(incident.has_exact_time).to eq true
					end
				end
				context 'student does not already exist' do
					let(:import) { behavior_importer.parse_row(row) }

					it 'creates a new student' do
						expect { import }.to change(Student, :count).by 1
					end
					it 'creates a new discipline incident' do
						expect { import }.to change(DisciplineIncident, :count).by 1
					end
					it 'associates the discipline incident to the correct student' do
						import
						expect(Student.last.discipline_incidents.last).to eq DisciplineIncident.last
					end
				end
			end
			context 'data does not include time' do
				let(:row) {	{
					state_id: '10',
					incident_code: 'Bullying',
					event_date: '2015-9-15',
					incident_time: '',
					incident_location: 'Hallway',
					incident_description: 'Making fun of another student'
				}	}

				before do
					import
	      end

				it 'assigns the date correctly' do
					incident = Student.last.reload.discipline_incidents.last
					expect(incident.event_date).to eq DateTime.new(2015, 9, 15)
				end
				it 'sets has exact time to false' do
					incident = Student.last.reload.discipline_incidents.last
					expect(incident.has_exact_time).to eq false
				end
			end
		end
		context 'bad data' do
			let(:row) {	{
				state_id: '10',
				event_date: 'Hallway',
			}	}
			it 'raises an error' do
				expect{ behavior_importer.parse_row(row) }.to raise_error
			end
		end
	end
end
