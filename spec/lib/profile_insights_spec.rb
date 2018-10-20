require 'spec_helper'

RSpec.describe ProfileInsights do
  describe '#as_json' do
    let!(:school) { FactoryBot.create(:school) }
    let!(:student) { FactoryBot.create(:student, school: school) }
    let!(:educator) { FactoryBot.create(:educator, :admin, school: school, full_name: "Teacher, Karen") }

    describe 'on happy path' do
      let!(:transition_note_text) do
        "What are this student's strengths?\neverything!\n\nWhat is this student's involvement in the school community like?\nreally good\n\nHow does this student relate to their peers?\nnot sure\n\nWho is the student's primary guardian?\nokay\n\nAny additional comments or good things to know about this student?\nnope :)"
      end
      let!(:transition_note) { FactoryBot.create(:transition_note, student: student, text: transition_note_text) }
      let!(:survey) { FactoryBot.create(:student_voice_completed_survey, student: student) }

      it 'works' do
        expect(ProfileInsights.new(student).as_json.size).to eq 6
      end
    end

    describe 'with survey responses that have empty text' do
      let!(:survey) do
        FactoryBot.create(:student_voice_completed_survey, {
          student: student,
          proud: '',
          best_qualities: '',
          activities_and_interests: '',
          nervous_or_stressed: '',
          learn_best: 'When I am motivated and in a good mood'
        })
      end

      it 'excludes survey responses that are empty text' do
        expect(ProfileInsights.new(student).as_json.size).to eq 1
      end
    end

    describe 'with teams' do
      let!(:pals) { TestPals.create! }

      it 'excludes survey responses that are empty text' do
        expect(ProfileInsights.new(pals.shs_freshman_mari).as_json).to eq [
          ProfileInsight.new('team_membership', {
            "activity_text"=>"Competitive Cheerleading Varsity",
            "coach_text"=>"Fatima Teacher"
          })
        ]
      end
    end
  end
end
