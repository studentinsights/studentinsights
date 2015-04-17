require 'fixtures/fake_attendance'
require 'rails_helper'

RSpec.describe AttendanceImporter do

	let(:attendance_importer) { AttendanceImporter.new }

	describe '#date_to_school_year' do
		it 'parses date correctly' do
			date_to_parse = FakeX2Attendance::FAKE_ATTENDANCE_TARDY["ATT_DATE"]
			expect(attendance_importer.date_to_school_year(date_to_parse)).to eq("2012-2013")
		end
	end
end

