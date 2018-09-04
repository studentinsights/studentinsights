require 'spec_helper'

RSpec.describe ProfileInsights do
  describe '#as_json' do
    let!(:school) { FactoryBot.create(:school) }
    let!(:student) { FactoryBot.create(:student, school: school) }
    let!(:educator) { FactoryBot.create(:educator, :admin, school: school, full_name: "Teacher, Karen") }
    let!(:transition_note_text) do
      "What are this student's strengths?\neverything!\n\nWhat is this student's involvement in the school community like?\nreally good\n\nHow does this student relate to their peers?\nnot sure\n\nWho is the student's primary guardian?\nokay\n\nAny additional comments or good things to know about this student?\nnope :)"
    end
    let!(:transition_note) { FactoryBot.create(:transition_note, student: student, text: transition_note_text) }
    let!(:survey) { FactoryBot.create(:student_voice_completed_survey, student: student) }

    it 'works on happy path' do
      expect(ProfileInsights.new(student).as_json.size).to eq 6
    end
  end
end
