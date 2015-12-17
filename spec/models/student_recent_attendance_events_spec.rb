require 'rails_helper'

RSpec.describe StudentRecentAttendanceEvents do

  let(:student) { FactoryGirl.create(:student_with_absence_in_january_2015) }
  let(:recent_attendance_events) { described_class.new(student) }

  before do
    # Freeze time to January 2015, so that the student's absence
    # in January 201 falls within his/her most recent school year
    january_2nd = DateTime.new(2015, 1, 2)
    Timecop.freeze(january_2nd)
  end

  after do
    Timecop.return
  end

  describe '#absences_count' do
    it 'returns the correct number of absences' do
      expect(recent_attendance_events.absences_count).to eq 1
    end
  end

  describe '#tardies_count' do
    it 'returns the correct number of tardies' do
      expect(recent_attendance_events.tardies_count).to eq 0
    end
  end

  describe '#update_absences_count' do
    it 'updates the student model correctly' do
      recent_attendance_events.update_absences_count
      expect(student.reload.absences_count_most_recent_school_year).to eq 1
    end
  end

  describe '#update_tardies_count' do
    it 'updates the student model correctly' do
      recent_attendance_events.update_tardies_count
      expect(student.reload.tardies_count_most_recent_school_year).to eq 0
    end
  end
end
