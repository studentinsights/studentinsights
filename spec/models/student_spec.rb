require 'rails_helper'

RSpec.describe Student do

  describe '#registration_date_cannot_be_in_future' do
    context 'no registration date' do
      let(:student) { FactoryGirl.build(:student) }
      it 'is valid' do
        expect(student).to be_valid
      end
    end
    context 'future registration date' do
      let(:student) { FactoryGirl.build(:student, registration_date: Time.now + 1.year) }
      it 'is invalid' do
        expect(student).to be_invalid
      end
    end
    context 'past registration date' do
      let(:student) { FactoryGirl.build(:student, :registered_last_year) }
      it 'is valid' do
        expect(student).to be_valid
      end
    end
  end

  describe '#most_recent_school_year_absences_count' do
    let(:student) { FactoryGirl.create(:student) }
    let(:school_year) { FactoryGirl.create(:school_year) }
    let(:student_school_year) {
      StudentSchoolYear.create(student: student, school_year: school_year)
    }

    context 'no absences ever' do

      it 'returns zero' do
        expect(student.most_recent_school_year_absences_count).to eq(0)
      end
    end

    context 'no absences this school year, one last year' do
      let!(:absence) {
        FactoryGirl.create(:absence,
          student: student,
          student_school_year: student_school_year,
          occurred_at: DateTime.new(2016, 9, 1)
        )
      }

      it 'returns zero' do
        Timecop.freeze(DateTime.new(2017, 9, 1)) do
          expect(student.most_recent_school_year_absences_count).to eq(0)
        end
      end
    end

    context 'two absences this school year (first half of year)' do
      before do
        FactoryGirl.create(:absence,
          student: student,
          student_school_year: student_school_year,
          occurred_at: DateTime.new(2017, 9, 1)
        )
        FactoryGirl.create(:absence,
          student: student,
          student_school_year: student_school_year,
          occurred_at: DateTime.new(2017, 9, 2)
        )
      end

      it 'returns two' do
        Timecop.freeze(DateTime.new(2018, 6, 1)) do
          expect(student.most_recent_school_year_absences_count).to eq(2)
        end
      end
    end

    context 'two absences this school year (second half of year)' do
      before do
        FactoryGirl.create(:absence,
          student: student,
          student_school_year: student_school_year,
          occurred_at: DateTime.new(2018, 5, 1)
        )
        FactoryGirl.create(:absence,
          student: student,
          student_school_year: student_school_year,
          occurred_at: DateTime.new(2018, 5, 2)
        )
      end

      it 'returns two' do
        Timecop.freeze(DateTime.new(2018, 6, 1)) do
          expect(student.most_recent_school_year_absences_count).to eq(2)
        end
      end
    end
  end

  describe '#latest_result_by_family_and_subject' do
    let(:student) { FactoryGirl.create(:student) }
    let(:assessment_family) { "MCAS" }
    let(:assessment_subject) { "Mathematics" }
    let(:assessment) { Assessment.create!(
        family: assessment_family,
        subject: assessment_subject
      )
    }
    let(:result) { student.latest_result_by_family_and_subject("MCAS", "Mathematics") }

    context 'MCAS Math' do
      context 'when the student has no student assessment results' do
        it 'returns nil' do
          expect(result).to be_nil
        end
      end
      context 'when the student has results' do
        let!(:mcas_math_result) {
          StudentAssessment.create!(
            student: student,
            assessment: assessment,
            date_taken: Date.today - 1.year,
          )
        }
        context 'when the student has a Math result but not MCAS' do
          let(:assessment_family) { "Doc's Special Exam" }
          it 'returns nil' do
            expect(result).to be_nil
          end
        end
        context 'when the student has an MCAS Math result' do
          context 'when the student has one MCAS Math result' do
            it 'returns the MCAS result' do
              expect(result).to eq(mcas_math_result)
            end
          end
          context 'when the student has multiple MCAS math results' do
            let!(:more_recent_mcas_math_result) {
              StudentAssessment.create!(
                student: student,
                assessment: assessment,
                date_taken: Date.today,
              )
            }
            it 'returns the later one' do
              expect(result).to eq(more_recent_mcas_math_result)
            end
          end
        end
      end
    end
  end

  describe '#ordered_results_by_family_and_subject' do
    let(:student) { FactoryGirl.create(:student) }
    let!(:mcas_math) { Assessment.create!(family: "MCAS", subject: "Mathematics") }
    let(:result) { student.ordered_results_by_family_and_subject("MCAS", "Mathematics") }

    context 'when the student has no MCAS Math result' do
      it 'returns an empty set' do
        expect(result).to be_empty
      end
    end
    context 'when one MCAS Math result exists' do
      let!(:mcas_math_result) {
        StudentAssessment.create!(
          student: student,
          assessment: mcas_math,
          date_taken: Date.today,
        )
      }
      it "returns the student's most recent MCAS math results" do
        expect(result).to eq([mcas_math_result])
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
        expect(result).to eq([
          oldest_mcas_math_result,
          middle_mcas_math_result,
          newest_mcas_math_result
        ])
      end
    end
  end

  describe '#find_student_school_years' do
    context 'school years in the 2010s' do
      let!(:sy_2014_2015) { FactoryGirl.create(:sy_2014_2015) }
      let!(:sy_2013_2014) { FactoryGirl.create(:sy_2013_2014) }
      let!(:sy_2012_2013) { FactoryGirl.create(:sy_2012_2013) }

      context 'student has registration date' do
        let!(:student) { FactoryGirl.create(:student_who_registered_in_2013_2014) }
        it 'calculates student school years based on registration date' do
          Timecop.freeze(Time.new(2015, 5, 24)) do
            expect(student.find_student_school_years).to eq([sy_2014_2015, sy_2013_2014])
          end
        end
      end

      context 'student has numerical grade level (1 through 12)' do
        context 'student is in 2nd grade' do
          let(:student) { FactoryGirl.create(:second_grade_student) }
          it 'assumes student has been attending SPS since K' do
            Timecop.freeze(Time.new(2015, 5, 24)) do
              expect(student.find_student_school_years).to eq([sy_2014_2015, sy_2013_2014, sy_2012_2013])
            end
          end
        end
      end

      context 'student has non-numerical grade level' do
        context 'student grade level is PK' do
          let(:student) { FactoryGirl.create(:pre_k_student) }
          it 'assumes student is in 1st year of SPS' do
            Timecop.freeze(Time.new(2015, 5, 24)) do
              expect(student.find_student_school_years).to eq([sy_2014_2015])
            end
          end
        end
      end

    end
  end

  describe '#update_student_school_years' do
    context 'when student has been in school for two years' do
      let!(:student) { FactoryGirl.build(:student_who_registered_in_2013_2014) }
      it 'creates two new student school years' do
        Timecop.freeze(Time.new(2015, 5, 24)) do
          expect {
            student.save
          }.to change {
            StudentSchoolYear.count
          }.by 2
        end
      end
      it 'assigns the student school year attributes' do
        Timecop.freeze(Time.new(2015, 5, 24)) do
          student.save
          expect(StudentSchoolYear.last.student).to eq(student)
          expect(StudentSchoolYear.last.school_year.name).to eq '2013-2014'
          expect(StudentSchoolYear.first.school_year.name).to eq '2014-2015'
        end
      end
    end
  end

  describe '#update_recent_student_assessments' do
    context 'has student assessments' do
      let(:student) { FactoryGirl.create(:student_with_mcas_math_advanced_and_star_math_warning_assessments) }
      it 'sets correct attribute on the student' do
        student.update_recent_student_assessments
        expect(student.reload.most_recent_mcas_math_performance).to eq 'A'
        expect(student.reload.most_recent_star_math_percentile).to eq 8
      end
    end
  end

  describe '#update_risk_level' do
    context 'no pre-existing risk level' do
      context 'non-ELL student with no test results' do
        let(:student) { FactoryGirl.create(:student) }
        it 'creates a risk level' do
          expect { student.update_risk_level }.to change(StudentRiskLevel, :count).by 1
        end
        it 'assigns correct level' do
          student.update_risk_level
          student_risk_level = student.student_risk_level
          expect(student_risk_level.level).to eq nil
          expect(student.risk_level).to eq nil
        end
      end
      context 'ELL student with no test results' do
        let(:student) { FactoryGirl.build(:limited_english_student) }
        it 'creates a risk level' do
          expect { student.update_risk_level }.to change(StudentRiskLevel, :count).by 1
        end
        it 'assigns correct level' do
          student.update_risk_level
          student_risk_level = student.student_risk_level
          expect(student_risk_level.level).to eq 3
          expect(student.risk_level).to eq 3
        end
      end
    end
  end

  describe '#latest_access_results' do
    let(:student) { FactoryGirl.create(:student) }

    context 'student has no access results' do
      it 'returns nil' do
        expect(student.latest_access_results).to eq nil
      end
    end

    context 'student has access results' do
      let(:access) { FactoryGirl.create(:assessment, :access) }
      before {
        FactoryGirl.create(
          :student_assessment, student: student, assessment: access, performance_level: '3.0'
        )
      }

      it 'returns the correct hash of values by score' do
        expect(student.latest_access_results).to eq ({
          :composite=>'3.0', :comprehension=>nil, :literacy=>nil, :oral=>nil,
          :listening=>nil, :reading=>nil, :speaking=>nil, :writing=>nil
        })
      end
    end

  end

end
