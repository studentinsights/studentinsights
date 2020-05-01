require 'rails_helper'

RSpec.describe EventNoteDraft, type: :model do
  let!(:text_when_redacted) { RestrictedTextRedacter::TEXT_WHEN_REDACTED }
  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'allows nil event_note_type_id' do
      draft = FactoryBot.create(:event_note_draft, {
        text: 'foo',
        event_note_type_id: nil
      })
      expect(draft.valid?).to eq true
    end

    it 'enforces unique (draft_key, educator_id, student_id) at model layer' do
      attrs = {
        draft_key: 'abc',
        student_id: pals.shs_freshman_mari.id,
        educator_id: pals.uri.id,
        text: 'foo',
        event_note_type_id: 300
      }
      first_draft = FactoryBot.create(:event_note_draft, attrs.merge(text: 'first'))
      expect(first_draft.valid?).to eq true

      second_draft = FactoryBot.build(:event_note_draft, attrs.merge(text: 'second'))
      expect(second_draft.valid?).to eq false
      expect(second_draft.errors.details).to eq(draft_key: [{:error=>:taken, :value=>"abc"}])
    end

    it 'does not collide if same (draft_key, student_id) for different educators ' do
      uri_draft = FactoryBot.create(:event_note_draft, {
        draft_key: 'abc',
        student_id: pals.shs_freshman_mari.id,
        educator_id: pals.uri.id,
        text: 'foo',
        event_note_type_id: 300
      })
      jodi_draft = FactoryBot.create(:event_note_draft, {
        draft_key: 'abc',
        student_id: pals.shs_freshman_mari.id,
        educator_id: pals.shs_jodi.id,
        text: 'bar',
        event_note_type_id: 301
      })
      expect(uri_draft.valid?).to eq true
      expect(jodi_draft.valid?).to eq true
    end
  end

  describe '#as_json' do
    def create_draft(text, is_restricted)
      FactoryBot.create(:event_note_draft, text: text, is_restricted: is_restricted)
    end

    def ordered_test_relation
      [
        create_draft('foo-safe', false),
        create_draft('bar-RESTRICTED', true),
        create_draft('whatever-safe', false)
      ]
    end

    def note_texts(drafts_json)
      drafts_json.map {|json| json['text'] }
    end

    describe 'with a model of a normal note' do
      it 'works normally when :text is not included' do
        note = create_draft('foo-safe', false)
        json = note.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => note.student_id,
          'event_note_type_id' => note.event_note_type_id
        })
      end

      it 'works normally regardless of :dangerously_include_restricted_text' do
        json = create_draft('foo-safe', false).as_json(dangerously_include_restricted_text: true)
        expect(json['text']).to eq 'foo-safe'
      end

      it 'serializes :text by default' do
        expect(create_draft('foo-safe', false).as_json['text']).to eq 'foo-safe'
      end

      it 'serializes :text when asked explicitly' do
        expect(create_draft('foo-safe', false).as_json(only: [:text])['text']).to eq 'foo-safe'
      end
    end

    describe 'with a model of a restricted note' do
      it 'works normally when :text is not included' do
        note = create_draft('bar-RESTRICTED', true)
        json = note.as_json(only: [:student_id, :event_note_type_id])
        expect(json).to eq({
          'student_id' => note.student_id,
          'event_note_type_id' => note.event_note_type_id
        })
      end

      it 'does not serialize :text by default' do
        expect(create_draft('bar-RESTRICTED', true).as_json['text']).to eq text_when_redacted
      end

      it 'does not serialize :text even when asked explicitly' do
        expect(create_draft('bar-RESTRICTED', true).as_json(only: [:text])['text']).to eq text_when_redacted
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_text key' do
        json = create_draft('bar-RESTRICTED', true).as_json(dangerously_include_restricted_text: false)
        expect(json['text']).to eq text_when_redacted
      end

      it 'serializes :text only when given :dangerously_include_restricted_text: true' do
        json = create_draft('bar-RESTRICTED', true).as_json(dangerously_include_restricted_text: true)
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
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = ordered_test_relation.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_text key' do
        json = ordered_test_relation.as_json(dangerously_include_restricted_text: false)
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_text: true' do
        json = ordered_test_relation.as_json(dangerously_include_restricted_text: true)
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
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'does not serialize :text even when asked explicitly' do
        json = ordered_test_relation.to_a.as_json(only: [:text])
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'does not serializes :text just based on :dangerously_include_restricted_text key' do
        json = ordered_test_relation.to_a.as_json(dangerously_include_restricted_text: false)
        expect(note_texts(json)).to eq(['foo-safe', text_when_redacted, 'whatever-safe'])
      end

      it 'serializes :text only when given :dangerously_include_restricted_text: true' do
        json = ordered_test_relation.to_a.as_json(dangerously_include_restricted_text: true)
        expect(note_texts(json)).to eq(['foo-safe', 'bar-RESTRICTED', 'whatever-safe'])
      end
    end
  end
end
