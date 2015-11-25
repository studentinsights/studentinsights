require 'rails_helper'

RSpec.describe Student do
  describe '#latest_mcas_math_result' do
    let(:student) { FactoryGirl.create(:student) }
    let(:assessment_subject) { "Math" }
    let(:assessment_family) { "MCAS" }
    let!(:mcas_math) { Assessment.create!(family: assessment_family, subject: assessment_subject) }
    let!(:mcas_math_result) {
      StudentAssessment.create!(
        student: student,
        assessment: mcas_math,
        date_taken: DateTime.now,
      )
    }

    context 'when the student has no mcas math result' do
      let!(:mcas_math_result) { nil }
      it 'returns a missing student assessment' do
        expect(student.latest_mcas_math_result).to be_a(MissingStudentAssessment)
      end
    end
    context 'when the math subject exists' do
      it "returns the student's most recent MCAS math results" do
        expect(student.latest_mcas_math_result).to eq(mcas_math_result)
      end
    end
    context 'when the math subject does not exist' do
      let(:assessment_subject) { "Tacos" }
      it 'returns a missing student assessment' do
        expect(student.latest_mcas_math_result).to be_a(MissingStudentAssessment)
      end
    end
    context 'when the math family does not exist' do
      let(:assessment_family) { "Doc's Special Exam" }
      it 'returns a missing student assessment' do
        expect(student.latest_mcas_math_result).to be_a(MissingStudentAssessment)
      end
    end
  end

  describe '.ordered_mcas_math' do
    let(:student) { FactoryGirl.create(:student) }
    let!(:mcas_math) { Assessment.create!(family: "MCAS", subject: "Math") }

    context 'when the student has no MCAS Math result' do
      it 'returns a missing student assessment collection' do
        expect(student.ordered_mcas_math).to be_a(MissingStudentAssessmentCollection)
      end
    end
    context 'when one MCAS Math result exists' do
      let!(:mcas_math_result) {
        StudentAssessment.create!(
          student: student,
          assessment: mcas_math,
          date_taken: DateTime.now,
        )
      }
      it "returns the student's most recent MCAS math results" do
        expect(student.ordered_mcas_math).to eq([mcas_math_result])
      end
    end
    context 'when several MCAS Math results exist' do
      let!(:newest_mcas_math_result) {
        StudentAssessment.create!(
          student: student,
          assessment: mcas_math,
          date_taken: 1.year.ago,
        )
      }
      let!(:oldest_mcas_math_result) {
        StudentAssessment.create!(
          student: student,
          assessment: mcas_math,
          date_taken: 5.years.ago,
        )
      }
      let!(:middle_mcas_math_result) {
        StudentAssessment.create!(
          student: student,
          assessment: mcas_math,
          date_taken: 3.years.ago,
        )
      }
      it "returns the student's most MCAS math results in ascending order" do
        expect(student.ordered_mcas_math).to eq([
          oldest_mcas_math_result,
          middle_mcas_math_result,
          newest_mcas_math_result
        ])
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
  describe '#sort_by_school_year' do
    before { Timecop.freeze(DateTime.new(2015, 5, 1))  }
    after { Timecop.return }

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
        let(:student) { FactoryGirl.create(:student_with_discipline_incident) }
        it 'associates the incident with the school year' do
          discipline_incidents_sort = student.discipline_incidents.sort_by_school_year
          expect(discipline_incidents_sort).to eq(
            { "2014-2015" => [student.discipline_incidents.last] }
          )
        end
      end
    end
  end
  describe '#create_risk_level' do
    context 'create a non-ELL student' do
      let(:student) { FactoryGirl.build(:student) }
      it 'creates a risk level' do
        expect { student.save }.to change(StudentRiskLevel, :count).by 1
      end
      it 'assigns correct level' do
        student.save
        student_risk_level = student.student_risk_level
        expect(student_risk_level.level).to eq nil
      end
      it 'assigns explanation' do
        student.save
        student_risk_level = student.student_risk_level
        expect(student_risk_level.explanation).to eq 'This student is at Risk N/A because:<br/><br/><ul><li>There is not enough information to tell.</li></ul>'
      end
    end
    context 'create an ELL student' do
      let(:student) { FactoryGirl.build(:limited_english_student) }
      it 'creates a risk level' do
        expect { student.save }.to change(StudentRiskLevel, :count).by 1
      end
      it 'assigns correct level' do
        student.save
        student_risk_level = student.student_risk_level
        expect(student_risk_level.level).to eq 3
      end
      it 'assigns explanation' do
        student.save
        student_risk_level = student.student_risk_level
        expect(student_risk_level.explanation).to eq 'This student is at Risk 3 because:<br/><br/><ul><li>This student is limited English proficient.</li></ul>'
      end
    end
  end
end
