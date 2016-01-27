require 'rails_helper'

RSpec.describe Student do

  describe '#serialized_data' do
    let(:serialized_data) { student.serialized_data }

    context 'no events or student attributes' do
      let(:student) { FactoryGirl.create(:student) }
      it 'includes nil student attributes' do
        expect(serialized_data).to include({
         "disability" => nil,
         "first_name" => nil,
         "free_reduced_lunch" => nil,
         "grade" => nil,
         "hispanic_latino" => nil,
         "home_language" => nil,
         "last_name" => nil,
         "limited_english_proficiency" => nil,
         "most_recent_mcas_ela_growth" => nil,
         "most_recent_mcas_ela_performance" => nil,
         "most_recent_mcas_ela_scaled" => nil,
         "most_recent_mcas_math_growth" => nil,
         "most_recent_mcas_math_performance" => nil,
         "most_recent_mcas_math_scaled" => nil,
         "most_recent_star_math_percentile" => nil,
         "most_recent_star_reading_percentile" => nil,
         "plan_504" => nil,
         "program_assigned" => nil,
         "race" => nil,
         "registration_date" => nil,
         "school_id" => nil,
         "sped_level_of_need" => nil,
         "sped_placement" => nil,
         "state_id" => nil,
         "student_address" => nil,
        })
      end
      it 'returns an empty array of interventions' do
        expect(serialized_data[:interventions]).to eq []
      end
      it 'returns a discipline incident count of zero' do
        expect(serialized_data[:discipline_incidents_count]).to eq 0
      end
    end

    context 'with interventions' do
      let(:student) { FactoryGirl.create(:student_with_one_atp_intervention) }
      it 'returns 1 intervention' do
        expect(serialized_data[:interventions].size).to eq 1
      end
      it 'returns correct intervention data' do
        expect(serialized_data[:interventions][0]).to include({
          "student_id"=>student.id,
          "number_of_hours"=>10,
        })
      end
    end

  end

  describe '#latest_result_by_family_and_subject' do
    let(:student) { FactoryGirl.create(:student) }
    let(:assessment_family) { "MCAS" }
    let(:assessment_subject) { "Math" }
    let(:assessment) { Assessment.create!(
        family: assessment_family,
        subject: assessment_subject
      )
    }
    let(:result) { student.latest_result_by_family_and_subject("MCAS", "Math") }

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
        context 'when the student has an MCAS result but not in Math' do
          let(:assessment_subject) { "Tacos" }
          it 'returns nil' do
            expect(result).to be_nil
          end
        end
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
    let!(:mcas_math) { Assessment.create!(family: "MCAS", subject: "Math") }
    let(:result) { student.ordered_results_by_family_and_subject("MCAS", "Math") }

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
          date_taken: Date.new,
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

  describe '#absences_count_by_school_year' do
    context 'student with no absences or tardies' do
      let(:student) { FactoryGirl.create(:student_with_registration_date) }
      it 'returns the correct array' do
        expect(student.absences_count_by_school_year).to eq [0, 0]
      end
    end
    context 'student with absence' do
      let(:student) { FactoryGirl.create(:student_with_absence) }
      it 'returns the correct array' do
        expect(student.absences_count_by_school_year).to eq [1]
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
          expect(student.find_student_school_years).to eq([])
        end
      end
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

  describe '#create_risk_level' do
    context 'create a non-ELL student' do
      let(:student) { FactoryGirl.create(:student) }
      it 'creates a risk level' do
        expect { student.create_student_risk_level! }.to change(StudentRiskLevel, :count).by 1
      end
      it 'assigns correct level' do
        student.create_student_risk_level!
        student_risk_level = student.student_risk_level
        expect(student_risk_level.level).to eq nil
      end
      it 'assigns explanation' do
        student.create_student_risk_level!
        student_risk_level = student.student_risk_level
        expect(student_risk_level.explanation).to eq 'This student is at Risk N/A because:<br/><br/><ul><li>There is not enough information to tell.</li></ul>'
      end
    end
    context 'create an ELL student' do
      let(:student) { FactoryGirl.build(:limited_english_student) }
      it 'creates a risk level' do
        expect { student.create_student_risk_level! }.to change(StudentRiskLevel, :count).by 1
      end
      it 'assigns correct level' do
        student.create_student_risk_level!
        student_risk_level = student.student_risk_level
        expect(student_risk_level.level).to eq 3
      end
      it 'assigns explanation' do
        student.create_student_risk_level!
        student_risk_level = student.student_risk_level
        expect(student_risk_level.explanation).to eq 'This student is at Risk 3 because:<br/><br/><ul><li>This student is limited English proficient.</li></ul>'
      end
    end
  end
end
