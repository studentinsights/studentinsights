require 'rails_helper'

RSpec.describe EventNote, type: :model do

  context 'is_restricted defined' do
    let(:note) { FactoryBot.build(:event_note) }
    it 'is valid' do
      expect(note).to be_valid
    end
  end

  context 'is_restricted undefined' do
    let(:note) { FactoryBot.build(:event_note, is_restricted: nil) }
    it 'is invalid' do
      expect(note).to be_invalid
    end
  end

  # See also EventNoteRevision#as_json
  describe '#as_json' do
    def create_note(text, is_restricted)
      FactoryBot.create(:event_note, text: text, is_restricted: is_restricted)
    end

    def ordered_test_relation
      [
        create_note('foo-safe', false),
        create_note('bar-RESTRICTED', true),
        create_note('whatever-safe', false)
      ]
    end

    def note_texts(notes_json)
      notes_json.map {|json| json['text'] }
    end

    describe 'with a model of a normal note' do
      it 'works normally when :text is not included' do
        note = create_note('foo-safe', false)
        json = note.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => note.student_id,
          'event_note_type_id' => note.event_note_type_id
        })
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
        json = note.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => note.student_id,
          'event_note_type_id' => note.event_note_type_id
        })
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
        relation = ordered_test_relation
        json = relation.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq([
          {"student_id"=>relation[0].student_id, "event_note_type_id"=>relation[0].event_note_type_id},
          {"student_id"=>relation[1].student_id, "event_note_type_id"=>relation[1].event_note_type_id},
          {"student_id"=>relation[2].student_id, "event_note_type_id"=>relation[2].event_note_type_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = ordered_test_relation.as_json
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = ordered_test_relation.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = ordered_test_relation.as_json(dangerously_include_restricted_note_text: false)
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = ordered_test_relation.as_json(dangerously_include_restricted_note_text: true)
        expect(note_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end

    describe 'with an array including a restricted note' do
      it 'works normally when :text is not included' do
        array = ordered_test_relation.to_a
        json = array.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq([
          {"student_id"=>array[0].student_id, "event_note_type_id"=>array[0].event_note_type_id},
          {"student_id"=>array[1].student_id, "event_note_type_id"=>array[1].event_note_type_id},
          {"student_id"=>array[2].student_id, "event_note_type_id"=>array[2].event_note_type_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = ordered_test_relation.to_a.as_json
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = ordered_test_relation.to_a.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = ordered_test_relation.to_a.as_json(dangerously_include_restricted_note_text: false)
        expect(note_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = ordered_test_relation.to_a.as_json(dangerously_include_restricted_note_text: true)
        expect(note_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end
  end
end
