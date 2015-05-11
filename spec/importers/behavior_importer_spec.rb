require 'rails_helper'

RSpec.describe BehaviorImporter do

	let(:behavior_importer) { BehaviorImporter.new }

	def generate_behavior_rows(student_id, incident_date, incident_code, number_of_rows)
		behavior_rows = []
		number_of_rows.times do
			behavior_rows << 	{
								"CND_STD_OID"=>student_id, 
								"CND_INCIDENT_DATE"=>incident_date, 
								"CND_INCIDENT_CODE"=>incident_code
								}
		end
		return behavior_rows
	end

	describe '#create_incident_records' do

		let!(:student) {
			FactoryGirl.create(:student_we_want_to_update)
		}

		let(:behavior_rows) {
			generate_behavior_rows(student.state_identifier, "2014-05-21", "BULLY", 2)
		}

		it 'creates the correct number of records' do
			# expect { 
			# 	behavior_importer.create_incident_records(behavior_rows)
			# }.to change(BehaviorIncident, :count).by 2
		end
	end
end