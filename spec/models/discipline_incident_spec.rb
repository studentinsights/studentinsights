require 'rails_helper'

RSpec.describe DisciplineIncident do
  describe '#date_to_school_year' do
    context 'month falls in first half of school year' do
      let!(:discipline_incident) { DisciplineIncident.new(event_date: Time.new(2015, 9, 28)) }
      it 'associates the attendance event and school year' do
        discipline_incident.save
        expect(discipline_incident.reload.school_year).to eq SchoolYear.last
      end
      it 'parses date correctly' do
        discipline_incident.save
        expect(SchoolYear.last.reload.name).to eq '2015-2016'
      end
    end
    context 'month falls in second half of school year' do
      let!(:discipline_incident) { DisciplineIncident.new(event_date: Time.new(2015, 3, 28)) }
      it 'associates the attendance event and school year' do
        discipline_incident.save
        expect(discipline_incident.reload.school_year).to eq SchoolYear.last
      end
      it 'parses date correctly' do
        discipline_incident.save
        expect(SchoolYear.last.reload.name).to eq '2014-2015'
      end
    end
  end
end
