require 'spec_helper'

RSpec.describe ClassList do
  def create_transition_note(params = {})
    TransitionNote.create({
      educator_id: pals.west_counselor.id,
      student_id: pals.west_eighth_ryan.id,
      text: 'foo',
      is_restricted: false
    }.merge(params))
  end

  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'requires presence of educator, student' do
      expect(create_transition_note({
        educator_id: nil,
        student_id: nil
      }).errors.details).to eq({
        student: [{error: :blank}],
        educator: [{error: :blank}]
      })
    end

    it 'enforces only_one_regular_note' do
      expect(create_transition_note({is_restricted: false}).errors.details).to eq({})
      expect(create_transition_note({is_restricted: false}).errors.details).to eq({
        :student => [{:error=>"cannot have more than one regular note"}]
      })
    end

    it 'enforces only_one_restricted_note' do
      expect(create_transition_note({is_restricted: true}).errors.details).to eq({})
      expect(create_transition_note({is_restricted: true}).errors.details).to eq({
        :student => [{:error=>"cannot have more than one restricted note"}]
      })
    end

    it 'allows one of each' do
      expect(create_transition_note({is_restricted: true}).errors.details).to eq({})
      expect(create_transition_note({is_restricted: false}).errors.details).to eq({})
    end

    it 'enforces cannot_change_is_restricted' do
      transition_note = create_transition_note({is_restricted: true})
      expect(transition_note.errors.details).to eq({})

      transition_note.update({is_restricted: false})
      expect(transition_note.errors.details).to eq({
        :is_restricted=>[{:error=>"changing is_restricted is not allowed"}]
      })
    end
  end
end
