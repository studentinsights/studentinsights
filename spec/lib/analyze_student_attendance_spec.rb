require "spec_helper"
require_relative '../../lib/analyze_student_attendance'

RSpec.describe AnalyzeStudentAttendance do
  let(:attendance_fixture_path) { File.expand_path('../../fixtures/attendance_dump.csv', __FILE__) }
  let(:analyze) { AnalyzeStudentAttendance.new(attendance_fixture_path) }

  describe '#data' do
    it 'returns the data from the csv' do
      expect(analyze.data.length).to eq(1)
    end
  end
end
