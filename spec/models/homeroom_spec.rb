require 'rails_helper'

RSpec.describe Homeroom do

  describe '#school_matches_educator_school' do
    let!(:pals) { TestPals.create! }

    context 'school is different from educator school' do
      let(:healey_kindergarten_homeroom) { pals.healey_kindergarten_homeroom }
      let(:west) { pals.west }

      it 'is invalid' do
        healey_kindergarten_homeroom.school = west
        expect(healey_kindergarten_homeroom).to be_invalid
        expect(healey_kindergarten_homeroom.errors[:school]).to eq ["does not match educator's school"]
      end
    end
  end

  describe '#grades' do
    it 'returns single value when single grade' do
      homeroom = FactoryBot.create(:homeroom).tap do |h|
        3.times { h.students << FactoryBot.create(:student, grade: 'PK') }
      end
      expect(homeroom.grades).to eq ['PK']
    end

    it 'returns sorted list when mixed grades' do
      grades = ['9', '1', '11', 'PK', 'TK']
      3.times do
        shuffled = grades.shuffle
        homeroom = FactoryBot.create(:homeroom).tap do |h|
          shuffled.each do |grade|
            h.students << FactoryBot.create(:student, grade: grade)
          end
        end
        expect(homeroom.reload.students.size).to eq 5
        expect(homeroom.grades).to eq ['TK', 'PK', '1', '9', '11']
      end
    end
  end

  describe '#grade' do
    it 'works for all PK students' do
      homeroom = FactoryBot.create(:homeroom).tap do |h|
        3.times { h.students << FactoryBot.create(:student, grade: 'PK') }
      end
      expect(homeroom.grade).to eq "PK"
    end

    it 'works for all 2nd grade students' do
      homeroom = FactoryBot.create(:homeroom).tap do |h|
        3.times { h.students << FactoryBot.create(:student, grade: '2') }
      end
      expect(homeroom.grade).to eq "2"
    end
  end

  # These describe existing quirks and why migrating from eager `homeroom#grade` to
  # lazy `homeroom#grades` is better longer term.
  context '#update_grade' do
    it 'returns value for first student added in mixed-grade homerooms (eg, special education)' do
      grades = ['PK', '1', '2']
      5.times do
        shuffled = grades.shuffle
        homeroom = FactoryBot.create(:homeroom).tap do |h|
          shuffled.each do |grade|
            h.students << FactoryBot.create(:student, grade: grade)
          end
        end
        expect(homeroom.grade).to eq shuffled.first
      end
    end

    it 'has the value for first student added, even if they are later removed and no students left in that grade (eg, special education)' do
      homeroom = FactoryBot.create(:homeroom)
      prek_student = FactoryBot.create(:student, grade: 'PK')
      second_grade_student = FactoryBot.create(:student, grade: '2')
      homeroom.students << prek_student
      homeroom.students << second_grade_student
      expect(homeroom.grade).to eq 'PK'

      prek_student.destroy!
      expect(homeroom.grade).to eq 'PK' # not really what we want, but current behavior
    end
  end
end
