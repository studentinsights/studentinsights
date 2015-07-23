require 'rails_helper'

RSpec.describe Student do
  describe '#risk_level' do
    context 'limited english' do
      let(:student) { FactoryGirl.create(:limited_english_student) }
      it 'returns Risk Level 3' do
        expect(student.risk_level).to eq(3)
      end
    end
  end

  describe '#school_years' do
    context 'school years in the 2010s' do
      let!(:sy_2014_2015) { FactoryGirl.create(:sy_2014_2015) }
      let!(:sy_2013_2014) { FactoryGirl.create(:sy_2013_2014) }
      let!(:sy_2012_2013) { FactoryGirl.create(:sy_2012_2013) }

      context 'student has no registration date or grade' do
        let(:student) { FactoryGirl.create(:student) }
        it 'returns an empty array' do
          expect(student.school_years).to eq([])
        end
      end
      context 'student has registration date' do
        let!(:student) { FactoryGirl.create(:student_who_registered_in_2013_2014) }
        it 'calculates student school years based on registration date' do
          Timecop.freeze(Time.new(2015, 5, 24)) do
            expect(student.school_years).to eq([sy_2014_2015, sy_2013_2014])
          end
        end
      end
      context 'student has numerical grade level (1 through 12)' do
        context 'student is in 2nd grade' do
          let(:student) { FactoryGirl.create(:second_grade_student) }
          it 'assumes student has been attending SPS since K' do
            Timecop.freeze(Time.new(2015, 5, 24)) do
              expect(student.school_years).to eq([sy_2014_2015, sy_2013_2014, sy_2012_2013])
            end
          end
        end
      end
      context 'student has non-numerical grade level' do
        context 'student grade level is PK' do
          let(:student) { FactoryGirl.create(:pre_k_student) }
          it 'assumes student is in 1st year of SPS' do
            Timecop.freeze(Time.new(2015, 5, 24)) do
              expect(student.school_years).to eq([sy_2014_2015])
            end
          end
        end
      end
    end
  end
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
