require 'rails_helper'

RSpec.describe Homeroom do

  describe '#grade' do
    context 'with no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_student) }
      it 'is nil' do
        expect(homeroom.grade).to eq nil
      end
    end
    context 'with PK student' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_pre_k_student) }
      it 'is "PK"' do
        expect(homeroom.grade).to eq "PK"
      end
    end
    context 'with 2nd grade student' do
      let(:homeroom) { FactoryGirl.create(:homeroom_with_second_grader) }
      it 'is "2"' do
        expect(homeroom.grade).to eq "2"
      end
    end
  end
  describe '.destroy_empty_homerooms' do
    context 'one homeroom with no students' do
      let!(:homeroom) { FactoryGirl.create(:homeroom) }
      it 'deletes the homeroom' do
        expect { Homeroom.destroy_empty_homerooms }.to change(Homeroom, :count).by -1
      end
    end
    context 'zero homerooms with no student' do
      let!(:homeroom) { FactoryGirl.create(:homeroom_with_student) }
      it 'does nothing' do
        Homeroom.reset_counters(homeroom.id, :students)
        expect { Homeroom.destroy_empty_homerooms }.to change(Homeroom, :count).by 0
      end
    end
  end

  describe '#average_mcas_math_score' do
    context 'homerooms has no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      it 'returns nil' do
        expect(homeroom.average_mcas_math_score).to eq nil
      end
    end
    context 'homeroom has one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_mcas_math_score_240, homeroom: homeroom) }
      before { Student.update_recent_student_assessments }
      it 'returns the score of that student' do
        expect(homeroom.average_mcas_math_score).to eq 240
      end
    end
    context 'homeroom has more than one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_mcas_math_score_240, homeroom: homeroom) }
      let!(:other_student) { FactoryGirl.create(:student, :with_mcas_math_score_280, homeroom: homeroom) }
      before { Student.update_recent_student_assessments }
      it 'returns the average of their scores' do
        expect(homeroom.average_mcas_math_score).to eq 260
      end
    end
  end

  describe '#average_mcas_ela_score' do
    context 'homerooms has no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      it 'returns nil' do
        expect(homeroom.average_mcas_ela_score).to eq nil
      end
    end
    context 'homeroom has one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_mcas_ela_score_250, homeroom: homeroom) }
      before { Student.update_recent_student_assessments }
      it 'returns the score of that student' do
        expect(homeroom.average_mcas_ela_score).to eq 250
      end
    end
    context 'homeroom has more than one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_mcas_ela_score_250, homeroom: homeroom) }
      let!(:other_student) { FactoryGirl.create(:student, :with_mcas_ela_score_290, homeroom: homeroom) }
      before { Student.update_recent_student_assessments }
      it 'returns the average of their scores' do
        expect(homeroom.average_mcas_ela_score).to eq 270
      end
    end
  end

  describe '#average_absences_most_recent_school_year' do
    context 'homeroom has no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      it 'returns nil' do
        expect(homeroom.average_absences_most_recent_school_year).to eq nil
      end
    end
    context 'homeroom has one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_recent_absence, homeroom: homeroom) }
      before { Student.update_attendance_events_counts_most_recent_school_year }
      it 'returns that student\'s recent absences count' do
        expect(homeroom.average_absences_most_recent_school_year).to eq 1
      end
    end
    context 'homeroom has more than one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_recent_absence, homeroom: homeroom) }
      let!(:often_absent) { FactoryGirl.create(:student, :with_three_recent_absences, homeroom: homeroom) }
      before { Student.update_attendance_events_counts_most_recent_school_year }
      it 'return the average of their recent absences counts' do
        expect(homeroom.average_absences_most_recent_school_year).to eq 2
      end
    end
  end

  describe '#average_tardies_most_recent_school_year' do
    context 'homeroom has no students' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      it 'returns nil' do
        expect(homeroom.average_tardies_most_recent_school_year).to eq nil
      end
    end
    context 'homeroom has one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_recent_tardy, homeroom: homeroom) }
      before { Student.update_attendance_events_counts_most_recent_school_year }
      it 'returns that student\'s recent tardies count' do
        expect(homeroom.average_tardies_most_recent_school_year).to eq 1
      end
    end
    context 'homeroom has more than one student' do
      let(:homeroom) { FactoryGirl.create(:homeroom) }
      let!(:student) { FactoryGirl.create(:student, :with_recent_tardy, homeroom: homeroom) }
      let!(:often_late) { FactoryGirl.create(:student, :with_three_recent_tardies, homeroom: homeroom) }
      before { Student.update_attendance_events_counts_most_recent_school_year }
      it 'return the average of their recent tardies counts' do
        expect(homeroom.average_tardies_most_recent_school_year).to eq 2
      end
    end
  end

end
