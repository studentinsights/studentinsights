require 'rails_helper'

RSpec.describe StudentProfileChart do

  def generate_attendance_events(absences, tardies)
    arr = []
    absences.times do
      arr << AttendanceEvent.new(absence: true, tardy: false)
    end
    tardies.times do
      arr << AttendanceEvent.new(absence: false, tardy: true)
    end
    return arr
  end

  let(:student) { FactoryGirl.create(:student) }
  let(:chart) { StudentProfileChart.new(student) }

  describe '#attendance_series_absences' do
    let(:result) { chart.attendance_series_absences(sorted_attendance_events) }
    context 'no absences' do
      let(:sorted_attendance_events) {
        {
          "2015-2016" => generate_attendance_events(0, 1),
          "2014-2015" => generate_attendance_events(0, 1)
        }
      }
      it 'returns an array of zeroes' do
        expect(result).to eq([0, 0])
      end
    end
    context 'absences' do
      let(:sorted_attendance_events) {
        {
          "2015-2016" => generate_attendance_events(0, 1),
          "2014-2015" => generate_attendance_events(2, 1),
          "2013-2014" => generate_attendance_events(12, 7),
          "2012-2013" => generate_attendance_events(8, 3)
        }
      }
      it 'returns a correct array' do
        expect(result).to eq [8, 12, 2, 0]
      end
    end
  end
  describe '#attendance_series_tardies' do
    let(:result) { chart.attendance_series_tardies(sorted_attendance_events) }
    context 'no tardies' do
      let(:sorted_attendance_events) {
        {
          "2015-2016" => generate_attendance_events(1, 0),
          "2014-2015" => generate_attendance_events(1, 0)
        }
      }
      it 'returns an array of zeroes' do
        expect(result).to eq([0, 0])
      end
    end
    context 'tardies' do
      let(:sorted_attendance_events) {
        {
          "2015-2016" => generate_attendance_events(0, 1),
          "2014-2015" => generate_attendance_events(2, 1),
          "2013-2014" => generate_attendance_events(12, 7),
          "2012-2013" => generate_attendance_events(8, 3)
        }
      }
      it 'returns a correct array' do
        expect(result).to eq [3, 7, 1, 1]
      end
    end
  end
end
