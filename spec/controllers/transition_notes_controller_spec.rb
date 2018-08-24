require 'rails_helper'

RSpec.describe TransitionNotesController, type: :controller do
  let!(:pals) { TestPals.create! }
  let(:student) { pals.west_eighth_ryan }
  let!(:time_now) { pals.time_now }

  let(:params) {
    {
      format: :json,
      student_id: student.id,
      text: 'foo',
      is_restricted: false
    }
  }

  describe '#restricted_transition_note_json' do
    let!(:student) { pals.west_eighth_ryan }

    def get_restricted_transition_note_json(student_id)
      request.env['HTTPS'] = 'on'
      get :restricted_transition_note_json, params: {
        format: :json,
        student_id: student_id
      }
    end

    def create_restricted_transition_note_for(student)
      FactoryBot.create(:transition_note, {
        student_id: student.id,
        is_restricted: true,
        text: 'RESTRICTED-original-text'
      })
    end

    it 'permits access, and only sends down :text and :event_note_attachments' do
      create_restricted_transition_note_for(student)
      sign_in(pals.rich_districtwide)
      get_restricted_transition_note_json(student.id)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "text" => "RESTRICTED-original-text"
      })
    end

    it 'guards access based on student' do
      create_restricted_transition_note_for(student)
      sign_in(pals.healey_laura_principal)
      get_restricted_transition_note_json(student.id)
      expect(response.status).to eq 403
    end

    it 'guards access based on can_view_restricted_notes' do
      create_restricted_transition_note_for(student)
      sign_in(pals.shs_jodi)
      get_restricted_transition_note_json(student.id)
      expect(response.status).to eq 403
    end
  end

  describe '#update' do
    def update(params)
      request.env['HTTPS'] = 'on'
      post :update, params: params
    end

    context 'good params, authorized educator, new note' do
      it 'works' do
        sign_in(pals.west_counselor)
        update(params)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['result']).to eq 'ok'
        expect(TransitionNote.count).to eq 1
        expect(TransitionNote.last.text).to eq 'foo'
      end
    end

    context 'good params, authorized educator, updating note' do
      it 'works' do
        sign_in(pals.west_counselor)

        update(params)
        expect(TransitionNote.count).to eq 1
        expect(TransitionNote.last.text).to eq 'foo'

        update(params.merge({text: 'foofoofoo'}))
        expect(response.status).to eq 200
        expect(TransitionNote.count).to eq 1
        expect(TransitionNote.last.text).to eq 'foofoofoo'
      end
    end

    context 'non-K8 counselor educator' do
      it 'does not work' do
        sign_in(pals.west_marcus_teacher)
        update(params)
        expect(response.status).to eq 403
      end
    end

  end
end
