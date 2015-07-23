require 'rails_helper'

RSpec.describe Student do
  describe '#risk_level' do
    context 'missing MCAS and STAR results' do
      context 'not limited English' do
        let(:student) { FactoryGirl.create(:student) }
        it 'has Risk Level of nil' do
          expect(student.risk_level).to eq nil
        end
      end
      context 'limited english' do
        let(:student) { FactoryGirl.create(:limited_english_student) }
        it 'has Risk Level 3' do
          expect(student.risk_level).to eq 3
        end
      end
    end
    context 'has MCAS results but not STAR' do
      context 'has MCAS math but not MCAS ela' do
        context 'has a W value for MCAS math' do
          let(:student) { FactoryGirl.create(:student_with_mcas_math_warning) }
          it 'has risk level 3' do
            expect(student.risk_level).to eq 3
          end
        end
      end
      context 'has both MCAS math and MCAS ela' do
        context 'has advanced math and warning ela' do
          let(:student) { FactoryGirl.create(:student_with_mcas_advanced_math_and_warning_ela) }
          it 'has Risk Level 3' do
            expect(student.risk_level).to eq 3
          end
        end
      end
    end
    context 'has STAR results but not MCAS' do
      context 'has STAR math but not STAR reading' do
        context 'STAR math is between 30 and 85' do
          let(:student) { FactoryGirl.create(:student_with_star_between_30_85) }
          it 'has Risk Level 1' do
            expect(student.risk_level).to eq 1
          end
        end
      end
    end
    context 'has both MCAS and STAR results' do
      context 'MCAS is advanced but STAR is warning' do
        let(:student) { FactoryGirl.create(:student_with_mcas_advanced_and_star_warning) }
        it 'has Risk Level 3' do
          expect(student.risk_level).to eq 3
        end
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
