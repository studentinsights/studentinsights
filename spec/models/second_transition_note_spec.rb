require 'rails_helper'

RSpec.describe SecondTransitionNote, type: :model do
  let!(:pals) { TestPals.create! }

  def test_second_transition_note
    pals.west_eighth_ryan.second_transition_notes.first
  end

  describe 'validations' do
    it 'enforces form_json keys for SOMERVILLE_8TH_TO_9TH_GRADE' do
      note = SecondTransitionNote.create({
        recorded_at: pals.time_now - 5.days,
        educator: pals.west_counselor,
        student: pals.west_eighth_ryan,
        form_key: SecondTransitionNote::SOMERVILLE_8TH_TO_9TH_GRADE,
        form_json: {
          strengths: '',
          connecting: '',
          community: '',
          peers: '',
          other: '',
        },
        restricted_text: 'DANGEROUS restricted foo'
      })
      expect(note.errors.details).to eq(form_json: [{:error=>"missing expected keys"}])
    end
  end

  # See also EvenNote#as_json
  describe '#as_json' do
    it 'works normally when :restricted_text is not included' do
      second_transition_note = test_second_transition_note()
      json = second_transition_note.as_json(only: [:student_id])
      expect(json).to eq('student_id' => second_transition_note.student_id)
    end

    it 'redacts :restricted_text by default' do
      expect(test_second_transition_note().as_json['restricted_text']).to eq EventNote::REDACTED
    end

    it 'redacts :restricted_text when explicit asked for field' do
      expect(test_second_transition_note().as_json(only: [:restricted_text])['restricted_text']).to eq EventNote::REDACTED
    end

    it 'does not serializes just based on presence of :dangerously_include_restricted_text key' do
      json = test_second_transition_note().as_json(dangerously_include_restricted_text: false)
      expect(json['restricted_text']).to eq EventNote::REDACTED
    end

    it 'serializes :restricted_text only when given :dangerously_include_restricted_text: true' do
      json = test_second_transition_note().as_json(dangerously_include_restricted_text: true)
      expect(json['restricted_text']).to eq 'Ryan has worked with a counselor at Riverside in the past, Mikayla, but has not this year.  Contact 8th grade counselor for more.'
    end
  end

  describe '#has_restricted_text' do
    it 'works' do
      expect(test_second_transition_note().has_restricted_text).to eq true
    end

    it 'returns false on empty string or whitespace only' do
      second_transition_note = test_second_transition_note()
      second_transition_note.update!(restricted_text: " \n ")
      expect(second_transition_note.has_restricted_text).to eq false
    end
  end
end
