require 'rails_helper'

RSpec.describe AttendanceImporter do

	let(:attendance_importer) { AttendanceImporter.new }

	describe '#parse_row' do
		context 'good data' do
			context 'student already exists' do
				let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
				let(:row) { {state_id: '10', absence: '1', tardy: '0', event_date: '2015-2-2'} }
				it 'add attendence event to the correct student' do
					attendance_importer.parse_row(row)
					expect(student.reload.attendance_events.size).to eq 1
				end
			end
			context 'student does not already exist' do
				let(:row) { { state_id: '100', absence: '1', tardy: '0', event_date: '2015-2-2' } }
				it 'creates a new student' do
					expect {
						attendance_importer.parse_row(row)
					}.to change(Student, :count).by 1
				end
				it 'assigns the attendance event to the new student' do
					attendance_importer.parse_row(row)
					new_student = Student.last.reload
					expect(new_student.attendance_events.size).to eq 1
				end
			end
		end
		context 'bad data' do
			let(:row) { { state_id: '100', absence: '2015-2-2', tardy: '1', event_date: '0' } }
			it 'raises an error' do
				expect{ attendance_importer.parse_row(row) }.to raise_error
			end
		end
	end
end
