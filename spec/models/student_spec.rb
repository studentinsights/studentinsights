require 'rails_helper'

RSpec.describe Student do

  describe '#registration_date_cannot_be_in_future' do
    context 'no registration date' do
      let(:student) { FactoryBot.build(:student) }
      it 'is valid' do
        expect(student).to be_valid
      end
    end
    context 'future registration date' do
      let(:student) {
        FactoryBot.build(
          :student,
          registration_date: Time.now + 1.year,
          local_id: '2000',
          grade: '1'
        )
      }
      it 'is invalid' do
        expect(student).to be_invalid
        expect(student.errors.messages).to eq({
          registration_date: ["cannot be in future for student local id #2000"]
        })
      end
    end
    context 'past registration date' do
      let(:student) { FactoryBot.build(:student, :registered_last_year) }
      it 'is valid' do
        expect(student).to be_valid
      end
    end
  end

  describe '#most_recent_school_year_absences_count' do
    let(:student) { FactoryBot.create(:student) }

    context 'no absences ever' do

      it 'returns zero' do
        expect(student.most_recent_school_year_absences_count).to eq(0)
      end
    end

    context 'no absences this school year, one last year' do
      let!(:absence) {
        FactoryBot.create(:absence,
          student: student,
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
        FactoryBot.create(:absence,
          student: student,
          occurred_at: DateTime.new(2017, 9, 1)
        )
        FactoryBot.create(:absence,
          student: student,
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
        FactoryBot.create(:absence,
          student: student,
          occurred_at: DateTime.new(2018, 5, 1)
        )
        FactoryBot.create(:absence,
          student: student,
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

  describe '#latest_dibels' do
    let!(:student) { FactoryBot.create(:student) }
    let!(:recent_dibels_result) {
      DibelsResult.create!(
        student: student, benchmark: 'CORE', date_taken: DateTime.now - 1.day
      )
    }
    let!(:old_dibels_result) {
      DibelsResult.create!(
        student: student, benchmark: 'STRATEGIC', date_taken: DateTime.now - 3.years
      )
    }

    it 'chooses the most recent one' do
      latest_dibels = student.latest_dibels
      expect(latest_dibels.id).to eq(recent_dibels_result.id)
      expect(latest_dibels.benchmark).to eq('CORE')
    end
  end

  describe '#latest_result_by_family_and_subject' do
    let(:student) { FactoryBot.create(:student) }
    let(:assessment_family) { "MCAS" }
    let(:assessment_subject) { "Mathematics" }
    let(:assessment) do
      Assessment.create!(
        family: assessment_family,
        subject: assessment_subject
      )
    end
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
    let(:student) { FactoryBot.create(:student) }
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

  describe '#update_recent_student_assessments' do
    context 'has student assessments' do
      let(:student) { FactoryBot.create(:student_with_mcas_math_warning_assessment) }
      let!(:star_math) {
        StarMathResult.create!(
          student: student, percentile_rank: 8, grade_equivalent: '1.00',
          total_time: 100, date_taken: DateTime.now - 1.day
        )
      }

      it 'sets correct attribute on the student' do
        student.update_recent_student_assessments
        expect(student.reload.most_recent_mcas_math_performance).to eq 'W'
        expect(student.reload.most_recent_star_math_percentile).to eq 8
      end
    end
  end

  describe '#latest_access_results' do
    let(:student) { FactoryBot.create(:student) }

    context 'student has no access results' do
      it 'returns nil' do
        expect(student.latest_access_results).to eq nil
      end
    end

    context 'student has access results' do
      let(:access) { FactoryBot.create(:assessment, :access) }
      before {
        FactoryBot.create(
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

  describe '#validate_grade' do
    it 'prevents and prints out invalid grades' do
      student = FactoryBot.create(:student)
      was_successful = student.update(grade: 'foo')
      expect(was_successful).to eq false
      expect(student.errors.details).to eq({
        grade: [{:error=>"invalid grade: foo"}]
      })
    end
  end
end
