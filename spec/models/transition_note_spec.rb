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

  # See also EventNote#as_json
  describe '#as_json' do
    def create_note(text, is_restricted)
      FactoryBot.create(:transition_note, text: text, is_restricted: is_restricted)
    end

    def test_relation
      create_note('foo-safe', false)
      create_note('bar-RESTRICTED', true)
      create_note('whatever-safe', false)
      TransitionNote.all
    end

    def note_texts(notes_json)
      notes_json.map {|json| json['text'] }
    end

    describe 'with a model of a normal note' do
      it 'works normally when :text is not included' do
        note = create_note('foo-safe', false)
        json = note.as_json(only: [:student_id])
        expect(json).to eq({'student_id' => note.student_id})
      end

      it 'works normally regardless of :dangerously_include_restricted_note_text' do
        json = create_note('foo-safe', false).as_json(dangerously_include_restricted_note_text: true)
        expect(json['text']).to eq 'foo-safe'
      end

      it 'serializes :text by default' do
        expect(create_note('foo-safe', false).as_json['text']).to eq 'foo-safe'
      end

      it 'serializes :text when asked explicitly' do
        expect(create_note('foo-safe', false).as_json(only: [:text])['text']).to eq 'foo-safe'
      end
    end

    describe 'with a model of a restricted note' do
      it 'works normally when :text is not included' do
        note = create_note('bar-RESTRICTED', true)
        json = note.as_json(only: [:student_id])
        expect(json).to eq({'student_id' => note.student_id})
      end

      it 'does not serialize :text by default' do
        expect(create_note('bar-RESTRICTED', true).as_json['text']).to eq EventNote::REDACTED
      end

      it 'does not serialize :text even when asked explicitly' do
        expect(create_note('bar-RESTRICTED', true).as_json(only: [:text])['text']).to eq EventNote::REDACTED
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = create_note('bar-RESTRICTED', true).as_json(dangerously_include_restricted_note_text: false)
        expect(json['text']).to eq EventNote::REDACTED
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = create_note('bar-RESTRICTED', true).as_json(dangerously_include_restricted_note_text: true)
        expect(json['text']).to eq 'bar-RESTRICTED'
      end
    end

    describe 'with a relation including a restricted note' do
      it 'works normally when :text is not included' do
        relation = test_relation
        json = relation.as_json(only: [:student_id])
        expect(json).to eq([
          {"student_id"=>relation[0].student_id},
          {"student_id"=>relation[1].student_id},
          {"student_id"=>relation[2].student_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = test_relation.as_json
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = test_relation.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = test_relation.as_json(dangerously_include_restricted_note_text: false)
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = test_relation.as_json(dangerously_include_restricted_note_text: true)
        expect(note_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end

    describe 'with an array including a restricted note' do
      it 'works normally when :text is not included' do
        array = test_relation.to_a
        json = array.as_json(only: [:student_id])
        expect(json).to eq([
          {"student_id"=>array[0].student_id},
          {"student_id"=>array[1].student_id},
          {"student_id"=>array[2].student_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = test_relation.to_a.as_json
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = test_relation.to_a.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = test_relation.to_a.as_json(dangerously_include_restricted_note_text: false)
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = test_relation.to_a.as_json(dangerously_include_restricted_note_text: true)
        expect(note_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end
  end
end
