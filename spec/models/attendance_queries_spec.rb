require 'rails_helper'

RSpec.describe AttendanceQueries do
  let(:school) { FactoryGirl.create(:school) }
  let(:school_year) { FactoryGirl.create(:school_year) }
  let(:perfect_student) { FactoryGirl.create(:student, school: school) }
  let!(:perfect_student_school_year) { FactoryGirl.create(:student_school_year, student: perfect_student, school_year: school_year) }

  subject(:queries) { AttendanceQueries.new(school) }

  describe '#absent_students' do
    let(:student) { FactoryGirl.create(:student, school: school) }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student, school_year: school_year) }

    before { FactoryGirl.create(:absence, student_school_year: student_school_year) }

    it 'does not return a student without absences' do
      expect(queries.absent_students).not_to include(perfect_student)
    end

    context 'one student with absences' do
      it 'returns the student' do
        expect(queries.absent_students).to include(student)
      end
    end

    context 'two students with absences' do
      let(:another_student) { FactoryGirl.create(:student, school: school) }
      before do
        another_school_year = FactoryGirl.create(:student_school_year, student: another_student, school_year: school_year)
        FactoryGirl.create_list(:absence, 35, student_school_year: another_school_year)
      end

      it 'returns the students ordered by number of absences' do
        expect(queries.absent_students).to eq [another_student, student]
      end

    end

  end

  describe '#tardy_students' do
    let(:student) { FactoryGirl.create(:student, school: school) }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student, school_year: school_year) }

    before { FactoryGirl.create(:tardy, student_school_year: student_school_year) }

    it 'does not return a student without tardies' do
      expect(queries.tardy_students).not_to include(perfect_student)
    end

    context 'one student with tardies' do
      it 'returns the student' do
        expect(queries.tardy_students).to include(student)
      end
    end

    context 'two students with tardies' do
      let(:another_student) { FactoryGirl.create(:student, school: school) }
      before do
        another_school_year = FactoryGirl.create(:student_school_year, student: another_student, school_year: school_year)
        FactoryGirl.create_list(:tardy, 35, student_school_year: another_school_year)
      end

      it 'returns the students ordered by number of absences' do
        expect(queries.tardy_students).to eq [another_student, student]
      end

    end

  end

  describe '#top_5_absence_concerns_serialized' do
    let(:student) { FactoryGirl.create(:student, school: school) }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student, school_year: school_year) }

    before { FactoryGirl.create(:absence, student_school_year: student_school_year) }

    it 'presents serialized absence concerns' do
      expect(queries.top_5_absence_concerns_serialized).to eq [
        { :name => nil, :result_value => 1, :interventions_count => 0, :id => student.id }
      ]
    end

  end

  describe '#top_5_tardy_concerns_serialized' do
    let(:student) { FactoryGirl.create(:student, school: school) }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student, school_year: school_year) }

    before { FactoryGirl.create(:tardy, student_school_year: student_school_year) }

    it 'presents serialized tardy concerns' do
      expect(queries.top_5_tardy_concerns_serialized).to eq [
        { :name => nil, :result_value => 1, :interventions_count => 0, :id => student.id }
      ]
    end

  end

end
