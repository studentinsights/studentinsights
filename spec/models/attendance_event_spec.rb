require 'rails_helper'

RSpec.describe AttendanceEvent do
  describe '#date_to_school_year' do
    context 'month falls in first half of school year' do
      let(:attendance_event) { AttendanceEvent.new(event_date: Time.new(2015, 9, 28)) }
      it 'creates a new school year object' do
        expect {
          attendance_event.save
        }.to change(SchoolYear, :count).by 1
      end
      it 'associates the attendance event and school year' do
        attendance_event.save
        expect(attendance_event.reload.school_year).to eq SchoolYear.last
      end
      it 'parses date correctly' do
        attendance_event.save
        expect(SchoolYear.last.reload.name).to eq '2015-2016' 
      end
    end
    context 'month falls in second half of school year' do
      let(:attendance_event) { AttendanceEvent.new(event_date: Time.new(2015, 3, 28)) }
      it 'creates a new school year object' do
        expect {
          attendance_event.save
        }.to change(SchoolYear, :count).by 1
      end
      it 'associates the attendance event and school year' do
        attendance_event.save
        expect(attendance_event.reload.school_year).to eq SchoolYear.last
      end
      it 'parses date correctly' do
        attendance_event.save
        expect(SchoolYear.last.reload.name).to eq '2014-2015'
      end
    end
  end
end