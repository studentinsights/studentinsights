require 'rails_helper'

RSpec.describe AttendanceImporter do

	let(:attendance_importer) { AttendanceImporter.new }

	describe '#parse_row' do
		context 'good data' do
			context 'student already exists' do
				let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
				let(:row) { [ nil, '10', nil, '1', '0', '2015-2-2'] }
				it 'add attendence event to the correct student' do
					attendance_importer.parse_row(row)
					expect(student.reload.attendance_events.size).to eq 1
				end
			end
			context 'student does not already exist' do
				let(:row) { [ nil, '100', nil, '1', '0', '2015-2-2' ] }
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
			let(:row) { [ nil, nil, nil, '2015-2-2', '1', '0' ] }
			it 'raises an error' do
				expect{ attendance_importer.parse_row(row) }.to raise_error
			end
		end
	end
end