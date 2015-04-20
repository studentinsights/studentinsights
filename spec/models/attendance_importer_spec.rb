require 'fixtures/fake_attendance'
require 'rails_helper'

RSpec.describe AttendanceImporter do

	let(:attendance_importer) { AttendanceImporter.new }

	def generate_x2_attendance_rows(year, month, number_of_tardies, number_of_absences)
		rows = []
		number_of_absences.times do
			date = Time.new(year, month, 1).strftime("%Y-%m-%d")
			rows << FakeX2Attendance.generate_row(date, '0', '1')
		end
		number_of_tardies.times do
			date = Time.new(year, month, 1).strftime("%Y-%m-%d")
			rows << FakeX2Attendance.generate_row(date, '1', '0')
		end
		return rows
	end

	describe '#date_to_school_year' do
		context 'month falls in first half of school year' do
			it 'parses date correctly' do
				date_to_parse = FakeX2Attendance::FAKE_ATTENDANCE_SEPTEMBER["ATT_DATE"]
				expect(attendance_importer.date_to_school_year(date_to_parse)).to eq("2013-2014")
			end
		end
		context 'month falls in second half of school year' do
			it 'parses date correctly' do
				date_to_parse = FakeX2Attendance::FAKE_ATTENDANCE_MARCH["ATT_DATE"]
				expect(attendance_importer.date_to_school_year(date_to_parse)).to eq("2012-2013")
			end
		end
	end

	describe '#aggregate_attendance_to_school_year' do
		context 'student with absences and no tardies' do
			let(:absences_no_tardies) {
				generate_x2_attendance_rows(2015, 3, 0, 3) + generate_x2_attendance_rows(2015, 9, 0, 5)
			}
			let(:result) {
				attendance_importer.aggregate_attendance_to_school_year(absences_no_tardies)
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
				generate_x2_attendance_rows(2015, 3, 2, 3) + generate_x2_attendance_rows(2015, 9, 4, 5)
			}
			let(:result) {
				attendance_importer.aggregate_attendance_to_school_year(absences_and_tardies)
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

