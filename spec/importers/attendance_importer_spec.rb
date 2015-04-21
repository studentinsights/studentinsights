require 'fixtures/fake_attendance'
require 'rails_helper'

RSpec.describe AttendanceImporter do

	let(:attendance_importer) { AttendanceImporter.new }

	def generate_x2_attendance_rows(student_state_id, year, month, number_of_tardies, number_of_absences)
		rows = []
		number_of_absences.times do
			date = Time.new(year, month, 1).strftime("%Y-%m-%d")
			rows << FakeX2Attendance.generate_row(student_state_id, date, '0', '1')
		end
		number_of_tardies.times do
			date = Time.new(year, month, 1).strftime("%Y-%m-%d")
			rows << FakeX2Attendance.generate_row(student_state_id, date, '1', '0')
		end
		return rows
	end

	describe '#date_to_school_year' do
		context 'month falls in first half of school year' do
			it 'parses date correctly' do
				expect(attendance_importer.date_to_school_year('2013-09-28')).to eq("2013-2014")
			end
		end
		context 'month falls in second half of school year' do
			it 'parses date correctly' do
				expect(attendance_importer.date_to_school_year('2013-03-28')).to eq("2012-2013")
			end
		end
	end

	describe '#create_or_update_attendance_result' do
		let(:attendance_result) { FakeX2Attendance::FAKE_PARSED_ATTENDANCE_RESULT }
		context 'student with attendance result for school year' do
			let!(:student) { FactoryGirl.create(:student_with_attendance_result) }
			let(:result) { attendance_importer.create_or_update_attendance_result(attendance_result, student) }
			it 'does not create a new attendance result' do
				expect { result }.to change(AttendanceResult, :count).by(0)
			end
			it 'updates the attendance result correctly' do
				expect(result.number_of_absences).to eq 2
			end
		end
		context 'student without attendance result for school year' do
			let!(:student) { FactoryGirl.create(:student_without_attendance_result) }
			let(:result) { attendance_importer.create_or_update_attendance_result(attendance_result, student) }
			it 'creates a new attendance result' do
				expect { result }.to change(AttendanceResult, :count).by(1)
			end
			it 'sets the attendance result correctly' do
				expect(result.number_of_absences).to eq 2
			end
		end
	end

	describe '#sort_attendance_rows_by_student' do
		context 'sort between two students' do 
			let!(:tardy_student) { FactoryGirl.create(:student_for_aggregating_attendance) }
			let!(:absent_student) { FactoryGirl.create(:another_student_for_aggregating_attendance) }
			let!(:attendance_rows) { 
				generate_x2_attendance_rows(tardy_student.state_identifier, 2015, 4, 5, 0) +
				generate_x2_attendance_rows(absent_student.state_identifier, 2015, 4, 0, 3)
			}
			let!(:result) { attendance_importer.sort_attendance_rows_by_student_and_aggregate(attendance_rows) }
			it 'counts five tardies for the tardy student' do			
				expect(tardy_student.attendance_results.last.number_of_tardies).to eq 5
			end
			it 'counts three absences for the absent student' do 
				expect(absent_student.attendance_results.last.number_of_absences).to eq 3
			end
		end
	end

	describe '#aggregate_attendance_to_school_year' do
			let!(:student) { FactoryGirl.create(:student_for_aggregating_attendance) }
		context 'student with absences and no tardies' do
			let(:absences_no_tardies) {
				generate_x2_attendance_rows("200", 2015, 3, 0, 3) + generate_x2_attendance_rows("200", 2015, 9, 0, 5)
			}
			let(:result) {
				attendance_importer.aggregate_attendance_to_school_year(student, absences_no_tardies)
			}
			it 'groups absences by school year' do
				expect(result.length).to eq(2)
				expect(result[0][:school_year]).to eq("2014-2015")
				expect(result[1][:school_year]).to eq("2015-2016")
			end
			it 'sums number of absences by school year' do
				expect(result[0][:number_of_absences]).to eq(3)
				expect(result[1][:number_of_absences]).to eq(5)
			end
		end
		context 'student with absences and tardies' do
			let(:absences_and_tardies) {
				generate_x2_attendance_rows("001", 2015, 3, 2, 3) + generate_x2_attendance_rows("001", 2015, 9, 4, 5)
			}
			let(:result) {
				attendance_importer.aggregate_attendance_to_school_year(student, absences_and_tardies)
			}
			it 'sums number of absences by school year' do
				expect(result[0][:number_of_absences]).to eq(3)
				expect(result[0][:number_of_tardies]).to eq(2)
				expect(result[1][:number_of_absences]).to eq(5)
				expect(result[1][:number_of_tardies]).to eq(4)
			end
		end
	end
end