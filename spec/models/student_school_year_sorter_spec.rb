require 'rails_helper'

RSpec.describe StudentSchoolYearSorter, type: :model do

  describe "#sort" do
    let(:student) { FactoryGirl.create(:student) }

    before do
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 6, 1))

      Tardy.create!(student: student, occurred_at: DateTime.new(2016, 6, 2))
      Tardy.create!(student: student, occurred_at: DateTime.new(2016, 6, 3))

      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 15))
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 20))
      Absence.create!(student: student, occurred_at: DateTime.new(2016, 8, 25))

      Tardy.create!(student: student, occurred_at: DateTime.new(2016, 9, 15))
      Tardy.create!(student: student, occurred_at: DateTime.new(2016, 9, 20))
    end

    let(:sort) {
      described_class.new(student: student).sort
    }

    it "sorts into two student school years" do
      expect(sort.count).to eq 2
    end

    it "gets the name right" do
      expect(sort.first.name).to eq "2016-2017"
      expect(sort.second.name).to eq "2015-2016"
    end

    it "puts the right events into the first (most recent) school year" do
      absences = sort.first.absences
      expect(absences.count).to eq 3
      expect(absences.map { |a| a.occurred_at.day }).to eq([25, 20, 15])

      tardies = sort.first.tardies
      expect(tardies.count).to eq 2
      expect(tardies.map { |a| a.occurred_at.day }).to eq([20, 15])
    end

    it "puts the right events into the second (less recent) school year" do
      expect(sort.second.absences.count).to eq 1
      expect(sort.second.tardies.count).to eq 2
    end

  end

end
