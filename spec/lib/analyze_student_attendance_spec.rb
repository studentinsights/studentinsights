require "spec_helper"
require_relative '../../lib/analysis/analyze_student_attendance_table'

RSpec.describe AnalyzeStudentAttendanceTable do
  let(:attendance_fixture_path) { File.expand_path('../../fixtures/attendance_dump.csv', __FILE__) }
  let(:analyze) { AnalyzeStudentAttendanceTable.new(attendance_fixture_path) }
  let(:data) { analyze.data }

  describe '#data' do
    let(:first_row) { data[0] }
    let(:second_row) { data[1] }

    it 'corrects malformed rows and returns the corrent amount of data from the csv' do
      expect(data.length).to eq(2)
    end

    it 'parses the first row correctly' do
      expect(first_row[:att_tardy_ind]).to eq '1'
      expect(first_row[:att_comment]).to eq 'MTHR CALLED FEW MINUTES LATE'
      expect(first_row[:att_rat_oid]).to eq nil
    end

    it 'parses the second row correctly' do
      expect(second_row[:att_tardy_ind]).to eq '1'
      expect(second_row[:att_comment]).to eq 'still away with family'
      expect(second_row[:att_rat_oid]).to eq nil
    end

  end
end
