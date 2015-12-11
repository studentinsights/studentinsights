require 'rails_helper'

RSpec.describe StudentProfileChart do

  describe 'to_highcharts_percentile_rank_series' do
    let(:student_assessment) { FactoryGirl.create(:star_math_warning_assessment) }
    let(:input) { [student_assessment] }
    let(:student_profile_chart) { StudentProfileChart.new }
    it 'converts the student assessment to highcharts format' do
      result = student_profile_chart.to_highcharts_percentile_rank_series(input)
      expect(result).to eq [[2015, 6, 19, 8]]
    end
  end

  describe 'absences and tardies methods' do

    let(:student) { FactoryGirl.create(:student) }
    let(:chart) { StudentProfileChart.new(student) }
    let(:tardy) { FactoryGirl.create(:attendance_event, :tardy) }
    let(:absence) { FactoryGirl.create(:attendance_event, :absence) }

    describe '#attendance_series_absences' do
      let(:result) { chart.attendance_series_absences(sorted_attendance_events) }
      context 'no absences' do
        let(:sorted_attendance_events) {
          {
            "2015-2016" => [tardy],
            "2014-2015" => [tardy]
          }
        }
        it 'returns an array of zeroes' do
          expect(result).to eq [0, 0]
        end
      end
      context 'absences' do
        let(:sorted_attendance_events) {
          {
            "2015-2016" => [tardy],
            "2014-2015" => [absence, absence, tardy],
            "2013-2014" => [absence, absence],
            "2012-2013" => [absence, tardy]
          }
        }
        it 'returns a correct array' do
          expect(result).to eq [1, 2, 2, 0]
        end
      end
    end
    describe '#attendance_series_tardies' do
      let(:result) { chart.attendance_series_tardies(sorted_attendance_events) }
      context 'no tardies' do
        let(:sorted_attendance_events) {
          {
            "2015-2016" => [absence],
            "2014-2015" => [absence]
          }
        }
        it 'returns an array of zeroes' do
          expect(result).to eq [0, 0]
        end
      end
      context 'tardies' do
        let(:sorted_attendance_events) {
          {
            "2015-2016" => [tardy],
            "2014-2015" => [absence, absence, tardy],
            "2013-2014" => [absence, absence],
            "2012-2013" => [absence, tardy]
          }
        }
        it 'returns a correct array' do
          expect(result).to eq [1, 0, 1, 1]
        end
      end
    end
  end
end
