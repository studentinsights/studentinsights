require 'rails_helper'

describe EventNotesController, :type => :controller do
  let!(:pals) { TestPals.create! }
  let(:school) { FactoryBot.create(:school) }

  describe '#restricted_note_json' do
    def get_restricted_note_json(event_note_id)
      request.env['HTTPS'] = 'on'
      get :restricted_note_json, params: {
        format: :json,
        id: event_note_id
      }
    end

    def create_restricted_event_note_for_mari
      event_note = FactoryBot.create(:event_note, {
        student_id: pals.shs_freshman_mari.id,
        is_restricted: true,
        text: 'RESTRICTED-original-text'
      })
      attachment = EventNoteAttachment.create({
        event_note_id: event_note.id,
        url: 'https://docs.com/RESTRICTED-url'
      })
      event_note.update!(event_note_attachments: [attachment])
      event_note
    end

    it 'permits access, and only sends down :text and :event_note_attachments' do
      event_note = create_restricted_event_note_for_mari
      sign_in(pals.rich_districtwide)
      get_restricted_note_json(event_note.id)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "text" => "RESTRICTED-original-text",
        "event_note_attachments" => [{"url"=>"https://docs.com/RESTRICTED-url"}]
      })
    end

    it 'guards access based on student' do
      event_note = create_restricted_event_note_for_mari
      sign_in(pals.healey_laura_principal)
      get_restricted_note_json(event_note.id)
      expect(response.status).to eq 403
    end

    it 'guards access based on can_view_restricted_notes' do
      event_note = create_restricted_event_note_for_mari
      sign_in(pals.shs_jodi)
      get_restricted_note_json(event_note.id)
      expect(response.status).to eq 403
    end
  end

  describe '#create' do
    def make_create_request(student, event_note_params = {})
      request.env['HTTPS'] = 'on'
      post :create, params: {
        format: :json,
        student_id: student.id,
        draft_key: "fake-draft-key:#{SecureRandom.hex(16)}",
        event_note: event_note_params
      }
    end

    def post_params(event_note_params = {})
      {
        student_id: student.id,
        event_note_type_id: EventNoteType.all.sample.id,
        text: 'foo',
        is_restricted: false,
        event_note_attachments_attributes: []
      }.merge(event_note_params)
    end

    context 'happy path' do
      let!(:educator) { pals.shs_jodi }
      let!(:student) { pals.shs_freshman_mari }
      before { sign_in(educator) }

      it 'creates a new event note' do
        expect { make_create_request(student, post_params) }.to change(EventNote, :count).by 1
      end

      it 'responds with json' do
        make_create_request(student, post_params)
        expect(response.status).to eq 200
        expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
        expect(JSON.parse(response.body).keys).to contain_exactly(*[
          'id',
          'student_id',
          'educator_id',
          'event_note_type_id',
          'text',
          'recorded_at',
          'is_restricted',
          'latest_revision_at',
          'event_note_revisions_count',
          'attachments'
        ])
      end
    end

    context 'edge cases for parameters' do
      let!(:educator) { pals.shs_jodi }
      let!(:student) { pals.shs_freshman_mari }
      before { sign_in(educator) }

      it 'ignores educator_id in params' do
        make_create_request(student, post_params(educator_id: 350))
        expect(response.status).to eq 200
        response_body = JSON.parse(response.body)
        expect(response_body['educator_id']).to eq educator.id
        expect(response_body['educator_id']).not_to eq 350
      end

      it 'fails when missing student_id' do
        make_create_request(student, post_params.except(:student_id))
        expect(response.status).to eq 404
      end

      it 'fails when missing event_note_type_id' do
        make_create_request(student, post_params.except(:event_note_type_id))
        expect(response.status).to eq 422
        response_body = JSON.parse(response.body)
        expect(response_body).to eq("errors" => ["Event note type can't be blank"])
      end

      it 'setting recorded_at does not work' do
        make_create_request(student, post_params(recorded_at: 'bogus!'))
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['recorded_at']).not_to eq 'bogus!'
      end
    end

    context 'authorization checks, with Mari as test case' do
      let!(:student) { pals.shs_freshman_mari }

      it 'guards from creating a note for an unauthorized student' do
        sign_in(pals.healey_laura_principal)
        expect { make_create_request(student, post_params) }.to change(EventNote, :count).by 0
        expect(response.status).to eq 403
      end

      it 'guards setting is_restricted:true without access' do
        sign_in(pals.shs_jodi)
        expect { make_create_request(student, post_params) }.to change(EventNote, :count).by 1
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['is_restricted']).to eq false
      end

      it 'permits is_restricted:true with access, and response includes restricted note text' do
        sign_in(pals.rich_districtwide)
        expect {
          make_create_request(student, post_params({
            is_restricted: true,
            text: 'RESTRICTED-sensitive-message'
          }))
        }.to change(EventNote, :count).by 1
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['is_restricted']).to eq true
        expect(json['text']).to eq 'RESTRICTED-sensitive-message'
      end

      it 'guards access when not logged in' do
        expect { make_create_request(student, post_params) }.to change(EventNote, :count).by 0
        expect(response.status).to eq 401
      end
    end
  end

  describe '#update' do
    def make_update_request(student, event_note_id, event_note_params = {})
      request.env['HTTPS'] = 'on'
      put :update, params: {
        format: :json,
        student_id: student.id,
        id: event_note_id,
        event_note: {
          text: 'updated-foobar'
        }.merge(event_note_params)
      }
    end

    context 'happy path' do
      let!(:educator) { pals.shs_jodi }
      let!(:student) { pals.shs_freshman_mari }
      let!(:event_note) do
        FactoryBot.create(:event_note, {
          text: 'original-text',
          student_id: student.id,
          educator_id: educator.id,
          recorded_at: Time.parse('2017-03-11T11:11:11.000Z')
        })
      end
      before { sign_in(educator) }

      it 'does not add a new event note' do
        expect { make_update_request(student, event_note.id) }.to change(EventNote, :count).by 0
      end

      it 'updates an existing event note, but does not update `recorded_at`' do
        previous_event_note_recorded_at = event_note.recorded_at
        time_now = Time.parse('2017-03-16T11:12:00.000Z')
        Timecop.freeze(time_now) do
          make_update_request(student, event_note.id, text: 'updated-text!')
        end
        expect(response.status).to eq 200
        event_note.reload
        expect(event_note.recorded_at).not_to eq time_now
        expect(event_note.recorded_at).to eq previous_event_note_recorded_at
        expect(event_note.text).to eq 'updated-text!'
      end

      it 'creates a new event note revision' do
        expect { make_update_request(student, event_note.id, text: 'updated-value') }.to change(EventNoteRevision, :count).by 1
        expect(EventNoteRevision.last.version).to eq 1
        expect(EventNoteRevision.last.text).to eq 'original-text'
      end

      it 'creates a second event note revision and increments the version' do
        make_update_request(student, event_note.id, text: 'second-version')
        make_update_request(student, event_note.id, text: 'third-version')
        make_update_request(student, event_note.id, text: 'fourth-version')
        expect(EventNoteRevision.last.text).to eq 'third-version'
        expect(EventNoteRevision.last.version).to eq 3
      end

      it 'saves the previous note revision' do
        make_update_request(student, event_note.id, text: 'updated-text!')
        event_note_revision = EventNoteRevision.last
        expect(event_note_revision.event_note_id).to eq event_note.id
        expect(event_note_revision.version).to eq 1
        expect(event_note_revision.attributes.except(
          'id',
          'event_note_id',
          'version',
          'created_at',
          'updated_at',
          'is_restricted'
        )).to eq event_note.attributes.except(
          'id',
          'created_at',
          'updated_at',
          'recorded_at',
          'is_restricted'
        )
      end

      it 'echoes the note back as response' do
        time_now = Time.parse('2018-08-23T23:38:13.956Z')
        Timecop.freeze(time_now) do
          make_update_request(student, event_note.id, text: 'updated-text!')
        end
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json).to eq({
          "attachments" => [],
          "educator_id" => event_note.educator_id,
          "event_note_revisions_count" => 1,
          "event_note_type_id" => event_note.event_note_type_id,
          "id" => event_note.id,
          "is_restricted" => false,
          "student_id" => student.id,
          "text" => "updated-text!",
          "latest_revision_at" => '2018-08-23T23:38:13.956Z',
          "recorded_at" => '2017-03-11T11:11:11.000Z'
        })
      end
    end

    context 'authorization checks for notes' do
      let!(:student) { pals.shs_freshman_mari }
      let!(:note_from_jodi) do
        FactoryBot.create(:event_note, {
          student_id: student.id,
          text: 'original-text',
          educator_id: pals.shs_jodi.id
        })
      end

      it 'guards when not signed in' do
        make_update_request(student, note_from_jodi.id, text: 'whatever')
        expect(response.status).to eq 401
      end

      it 'guards from updating text for an unauthorized student' do
        sign_in(pals.healey_laura_principal)
        make_update_request(student, note_from_jodi.id, text: 'whatever')
        expect(response.status).to eq 403
      end

      it 'only allows updating text, not other fields' do
        sign_in(pals.shs_jodi)
        make_update_request(student, note_from_jodi.id, event_note_type_id: 99, text: 'new-value')

        note_from_jodi.reload
        expect(note_from_jodi.text).to eq 'new-value'
        expect(note_from_jodi.event_note_type_id).not_to eq 99
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['text']).to eq 'new-value'
        expect(json['event_note_type_id']).not_to eq 99
      end

      it 'does not allow updating notes from other educators' do
        sign_in(pals.uri)
        make_update_request(student, note_from_jodi.id, text: 'new-value-from-uri')
        expect(response.status).to eq 403
      end
    end

    context 'authorization checks for restricted notes' do
      let!(:student) { pals.shs_freshman_mari }
      let!(:harry_restricted_event_note) do
        FactoryBot.create(:event_note, {
          is_restricted: true,
          student_id: student.id,
          educator_id: pals.shs_harry_housemaster.id,
          text: 'RESTRICTED-original-sensitive-text'
        })
      end

      it 'guards from updating text for restricted note when student access but not can_view_restricted_notes' do
        sign_in(pals.shs_jodi)
        make_update_request(student, harry_restricted_event_note.id, text: 'changed')

        harry_restricted_event_note.reload
        expect(harry_restricted_event_note.text).not_to eq 'changed'
        expect(response.status).to eq 403
      end

      it 'permits updating text for restricted note when can_view_restricted_notes' do
        sign_in(pals.shs_harry_housemaster)
        make_update_request(student, harry_restricted_event_note.id, text: 'RESTRICTED-updated')

        harry_restricted_event_note.reload
        expect(harry_restricted_event_note.text).to eq 'RESTRICTED-updated'
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['text']).to eq 'RESTRICTED-updated'
      end

      it 'does not allow anyone to change `is_restricted`' do
        sign_in(pals.shs_harry_housemaster)
        make_update_request(student, harry_restricted_event_note.id, {
          text: 'RESTRICTED-beta',
          is_restricted: false
        })

        harry_restricted_event_note.reload
        expect(harry_restricted_event_note.is_restricted).to eq true
        expect(harry_restricted_event_note.text).to eq 'RESTRICTED-beta'
        json = JSON.parse(response.body)
        expect(json['is_restricted']).to eq true
        expect(json['text']).to eq 'RESTRICTED-beta'
      end
    end
  end

  describe '#destroy_attachment' do
    def destroy_attachment(id)
      request.env['HTTPS'] = 'on'
      delete :destroy_attachment, params: {
        format: :json,
        event_note_attachment_id: id
      }
    end

    def create_note_from_jodi
      note_from_jodi = FactoryBot.create(:event_note, {
        student_id: pals.shs_freshman_mari.id,
        educator_id: pals.shs_jodi.id,
        text: 'original-text-from-jodi',
      })
      EventNoteAttachment.create!({
        url: 'www.goodurl.com',
        event_note: note_from_jodi
      })
      note_from_jodi
    end

    it 'works and destroys the object and returns empty object' do
      note_from_jodi = create_note_from_jodi
      sign_in(pals.shs_jodi)
      destroy_attachment(note_from_jodi.event_note_attachments.first.id)
      expect(response.body).to eq '{}'
      expect(note_from_jodi.reload.event_note_attachments.size).to eq 0
    end

    it '404s on non-existent id' do
      sign_in(pals.uri)
      destroy_attachment(12345) # non-existent
      expect(response.status).to eq 404
    end

    context 'authorization checks' do
      it 'does not allow deleting attachments for notes created by other educators' do
        note_from_jodi = create_note_from_jodi
        sign_in(pals.uri)
        destroy_attachment(note_from_jodi.event_note_attachments.first.id)
        expect(response.status).to eq 403
        expect(note_from_jodi.reload.event_note_attachments.size).to eq 1
      end

      it 'does not allow deleting attachments if not authorized for student' do
        note_from_jodi = create_note_from_jodi
        sign_in(pals.healey_laura_principal)
        destroy_attachment(note_from_jodi.event_note_attachments.first.id)
        expect(response.status).to eq 403
        expect(note_from_jodi.reload.event_note_attachments.size).to eq 1
      end

      it 'does not allow users not signed in' do
        note_from_jodi = create_note_from_jodi
        destroy_attachment(note_from_jodi.event_note_attachments.first.id)
        expect(response.status).to eq 401
        expect(note_from_jodi.reload.event_note_attachments.size).to eq 1
      end
    end
  end

  describe '#mark_as_restricted' do
    def mark_as_restricted(id)
      request.env['HTTPS'] = 'on'
      put :mark_as_restricted, params: {
        format: :json,
        id: id
      }
    end

    def create_label!(educator)
      EducatorLabel.create!({
        educator: educator,
        label_key: 'can_mark_notes_as_restricted'
      })
    end

    def create_note_from_jodi(attrs = {})
      FactoryBot.create(:event_note, {
        student_id: pals.shs_freshman_mari.id,
        educator_id: pals.shs_jodi.id,
        text: 'original-text-from-jodi',
        is_restricted: false
      }.merge(attrs))
    end

    it 'works, updates the note and saves a revision' do
      create_label!(pals.shs_jodi)
      note_from_jodi = create_note_from_jodi(is_restricted: false)
      text_before = note_from_jodi.text

      sign_in(pals.shs_jodi)
      mark_as_restricted(note_from_jodi.id)
      expect(response.body).to eq '{}'
      expect(note_from_jodi.reload.is_restricted).to eq true
      expect(note_from_jodi.reload.text).to eq text_before
      expect(EventNoteRevision.all.size).to eq 1
      expect(EventNoteRevision.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "student_id"=>note_from_jodi.student_id,
        "educator_id"=>pals.shs_jodi.id,
        "event_note_type_id"=>note_from_jodi.event_note_type_id,
        "text"=>"<redacted>",
        "event_note_id"=>note_from_jodi.id,
        "version"=>1
      }])
    end

    it 'tolerates marking a note that is already restricted, if can_view_restricted_notes' do
      note_from_jodi = create_note_from_jodi(is_restricted: true)
      create_label!(pals.uri)
      sign_in(pals.uri)
      mark_as_restricted(note_from_jodi.id)

      expect(response.status).to eq 200
      expect(note_from_jodi.reload.is_restricted).to eq true
    end

    it '404s on non-existent id' do
      sign_in(pals.uri)
      mark_as_restricted(12345) # non-existent
      expect(response.status).to eq 404
    end

    it 'guards access when label not set' do
      note_from_jodi = create_note_from_jodi(is_restricted: false)

      sign_in(pals.shs_jodi)
      mark_as_restricted(note_from_jodi.id)

      expect(response.status).to eq 403
      expect(note_from_jodi.reload.is_restricted).to eq false
      expect(EventNoteRevision.all.size).to eq 0
    end

    it 'does allow marking notes as restricted that were creating by other educators' do
      create_label!(pals.uri)
      note_from_jodi = create_note_from_jodi(is_restricted: false)
      sign_in(pals.uri)
      mark_as_restricted(note_from_jodi.id)

      expect(response.status).to eq 200
      expect(note_from_jodi.reload.is_restricted).to eq true
    end

    it 'does not allow when no access for can_view_restricted_notes, even if note is already restricted' do
      note_from_jodi = create_note_from_jodi(is_restricted: true)
      create_label!(pals.shs_jodi)
      sign_in(pals.shs_jodi)
      mark_as_restricted(note_from_jodi.id)

      expect(response.status).to eq 403
      expect(note_from_jodi.reload.is_restricted).to eq true
    end

    it 'does not allow users not signed in' do
      note_from_jodi = create_note_from_jodi(is_restricted: false)
      mark_as_restricted(note_from_jodi.id)
      expect(response.status).to eq 401
      expect(note_from_jodi.reload.is_restricted).to eq false
    end
  end

  describe '#event_note_draft_json' do
    def make_draft(attrs = {})
      {
        event_note_type_id: EventNoteType.all.sample.id,
        is_restricted: false,
        text: 'foo-safe'
      }.merge(attrs)
    end

    def put_event_note_draft_json(params)
      request.env['HTTPS'] = 'on'
      put :event_note_draft_json, params: {
        format: :json,
      }.merge(params)
    end

    it 'works on happy path' do
      sign_in(pals.shs_jodi)
      draft = make_draft()
      response = put_event_note_draft_json({
        educator_id: pals.shs_jodi.id,
        student_id: pals.shs_freshman_mari.id,
        draft_key: 'abc',
        draft: draft
      })
      expect(response.status).to eq 201
      expect(response.body).to eq '{}'
      expect(EventNoteDraft.all.size).to eq 1
      expect(EventNoteDraft.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "student_id"=>pals.shs_freshman_mari.id,
        "educator_id"=>pals.shs_jodi.id,
        "event_note_type_id"=>draft[:event_note_type_id],
        "is_restricted"=>draft[:is_restricted],
        "draft_key"=>'abc',
        "text"=>"foo-safe"
      }])
    end

    it 'guards authorization, using Healey KF student as an example' do
      not_authorized_educators = Educator.all - [
        pals.uri,
        pals.rich_districtwide,
        pals.healey_laura_principal,
        pals.healey_vivian_teacher
      ]
      not_authorized_educators.each do |not_authorized_educator|
        sign_in(not_authorized_educator)
        draft = make_draft()
        response = put_event_note_draft_json({
          educator_id: not_authorized_educator.id,
          student_id: pals.healey_kindergarten_student.id,
          draft_key: 'abc',
          draft: draft
        })
        expect(response.status).to eq 403
        sign_out(not_authorized_educator)
      end
    end

    it 'updates existing record' do
      sign_in(pals.shs_jodi)
      draft = make_draft(text: 'first-version-of-text')
      response = put_event_note_draft_json({
        educator_id: pals.shs_jodi.id,
        student_id: pals.shs_freshman_mari.id,
        draft_key: 'abc',
        draft: draft
      })
      expect(response.status).to eq 201
      expect(EventNoteDraft.all.size).to eq 1
      expect(EventNoteDraft.first.text).to eq 'first-version-of-text'

      response = put_event_note_draft_json({
        educator_id: pals.shs_jodi.id,
        student_id: pals.shs_freshman_mari.id,
        draft_key: 'abc',
        draft: draft.merge(text: 'second-version-of-text')
      })
      expect(response.status).to eq 201
      expect(EventNoteDraft.all.size).to eq 1
      expect(EventNoteDraft.first.text).to eq 'second-version-of-text'
    end

    it 'does not trust all values for is_restricted: true' do
      sign_in(pals.healey_vivian_teacher)
      draft = make_draft(is_restricted: true)
      put_event_note_draft_json({
        educator_id: pals.healey_vivian_teacher.id,
        student_id: pals.healey_kindergarten_student.id,
        draft_key: 'abc',
        draft: draft
      })
      expect(EventNoteDraft.all.size).to eq 1
      expect(EventNoteDraft.first.is_restricted).to eq false
    end

    it 'allows educators with access to set is_restricted: true' do
      sign_in(pals.uri)
      draft = make_draft(is_restricted: true)
      put_event_note_draft_json({
        educator_id: pals.uri.id,
        student_id: pals.healey_kindergarten_student.id,
        draft_key: 'abc',
        draft: draft
      })
      expect(EventNoteDraft.all.size).to eq 1
      expect(EventNoteDraft.first.is_restricted).to eq true
    end
  end
end
