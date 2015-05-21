require 'rails_helper'

RSpec.describe Student do
  describe '#attendance_events#sort_by_school_year' do
    context 'no attendance events' do
      let!(:student) { FactoryGirl.create(:student) }
      it 'returns an empty hash' do
        expect(student.attendance_events.sort_by_school_year).to eq({})
      end
    end
    context 'one attendance event in one school year' do
      let!(:student) { FactoryGirl.create(:student_with_attendance_event) }
      it 'associates the event with the school year' do
        expect(student.attendance_events.sort_by_school_year).to eq(
          { "2014-2015" => [student.attendance_events.last] }
        )
      end
    end
  end
  describe '#discipline_incidents#sort_by_school_year' do
    context 'no discipline incidents' do
      let!(:student) { FactoryGirl.create(:student) }
      it 'returns an empty hash' do
        expect(student.discipline_incidents.sort_by_school_year).to eq({})
      end
    end
    context 'one discipline incident in one school year' do
      let!(:student) { FactoryGirl.create(:student_with_discipline_incident) }
      it 'associates the incident with the school year' do
        expect(student.discipline_incidents.sort_by_school_year).to eq(
          { "2014-2015" => [student.discipline_incidents.last] }
        )
      end
    end
  end
end
