require 'rails_helper'

RSpec.describe EventNoteRevision, type: :model do

  # This mirrors tests for EventNote#as_json - it's the same but is modified to
  # applied to EventNoteRevision.
  describe '#as_json' do
    def create_note_revision(text, is_restricted)
      event_note = FactoryBot.create(:event_note, text: 'current', is_restricted: is_restricted)
      FactoryBot.create(:event_note_revision, text: text, event_note: event_note)
    end

    def test_relation
      create_note_revision('foo-safe', false)
      create_note_revision('bar-RESTRICTED', true)
      create_note_revision('whatever-safe', false)
      EventNoteRevision.all
    end

    def revision_texts(revisions_json)
      revisions_json.map {|json| json['text'] }
    end

    describe 'with a model of a normal note' do
      it 'works normally when :text is not included' do
        revision = create_note_revision('foo-safe', false)
        json = revision.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => revision.student_id,
          'event_note_type_id' => revision.event_note_type_id
        })
      end

      it 'works normally regardless of :dangerously_include_restricted_note_text' do
        json = create_note_revision('foo-safe', false).as_json(dangerously_include_restricted_note_text: true)
        expect(json['text']).to eq 'foo-safe'
      end

      it 'serializes :text by default' do
        expect(create_note_revision('foo-safe', false).as_json['text']).to eq 'foo-safe'
      end

      it 'serializes :text when asked explicitly' do
        expect(create_note_revision('foo-safe', false).as_json(only: [:text])['text']).to eq 'foo-safe'
      end
    end

    describe 'with a model of a restricted note' do
      it 'works normally when :text is not included' do
        revision = create_note_revision('bar-RESTRICTED', true)
        json = revision.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => revision.student_id,
          'event_note_type_id' => revision.event_note_type_id
        })
      end

      it 'does not serialize :text by default' do
        expect(create_note_revision('bar-RESTRICTED', true).as_json['text']).to eq EventNote::REDACTED
      end

      it 'does not serialize :text even when asked explicitly' do
        expect(create_note_revision('bar-RESTRICTED', true).as_json(only: [:text])['text']).to eq EventNote::REDACTED
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = create_note_revision('bar-RESTRICTED', true).as_json(dangerously_include_restricted_note_text: false)
        expect(json['text']).to eq EventNote::REDACTED
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = create_note_revision('bar-RESTRICTED', true).as_json(dangerously_include_restricted_note_text: true)
        expect(json['text']).to eq 'bar-RESTRICTED'
      end
    end

    describe 'with a relation including a restricted note' do
      it 'works normally when :text is not included' do
        relation = test_relation
        json = relation.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq([
          {"student_id"=>relation[0].student_id, "event_note_type_id"=>relation[0].event_note_type_id},
          {"student_id"=>relation[1].student_id, "event_note_type_id"=>relation[1].event_note_type_id},
          {"student_id"=>relation[2].student_id, "event_note_type_id"=>relation[2].event_note_type_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = test_relation.as_json
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = test_relation.as_json(only: [:text])
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = test_relation.as_json(dangerously_include_restricted_note_text: false)
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = test_relation.as_json(dangerously_include_restricted_note_text: true)
        expect(revision_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end

    describe 'with an array including a restricted note' do
      it 'works normally when :text is not included' do
        array = test_relation.to_a
        json = array.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq([
          {"student_id"=>array[0].student_id, "event_note_type_id"=>array[0].event_note_type_id},
          {"student_id"=>array[1].student_id, "event_note_type_id"=>array[1].event_note_type_id},
          {"student_id"=>array[2].student_id, "event_note_type_id"=>array[2].event_note_type_id}
        ])
      end

      it 'does not serialize :text for restricted notes by default' do
        json = test_relation.to_a.as_json
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = test_relation.to_a.as_json(only: [:text])
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_note_text key' do
        json = test_relation.to_a.as_json(dangerously_include_restricted_note_text: false)
        expect(revision_texts(json)).to eq(['foo-safe', EventNote::REDACTED, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_note_text: true' do
        json = test_relation.to_a.as_json(dangerously_include_restricted_note_text: true)
        expect(revision_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end
  end
end
