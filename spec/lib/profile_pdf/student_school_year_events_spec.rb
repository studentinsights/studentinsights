require 'rails_helper'

RSpec.describe ProfilePdf::StudentSchoolYearEvents do
  let(:student) { FactoryBot.create(:student) }

  let(:events) {
    [
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 15)),
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 20)),
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 25)),
    ]
  }

  subject {
    ProfilePdf::StudentSchoolYearEvents.new(name: '2016-2017', events: events)
  }

  describe '#filtered_absences' do
    let(:filter_from_date) { DateTime.new(2016, 8, 1) }
    let(:filter_to_date) { DateTime.new(2016, 8, 22) }

    let(:filtered) {
      subject.filtered_absences(filter_from_date, filter_to_date)
    }

    it 'filters absences correctly' do
      expect(filtered.count).to eq 2
      expect(filtered.map { |f| f.occurred_at.day }).to eq [20, 15]
    end

  end

end
