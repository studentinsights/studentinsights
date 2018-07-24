require 'rails_helper'

describe EventNotesController, :type => :controller do
  let(:school) { FactoryBot.create(:school) }

  describe '#create' do
    def make_post_request(student, event_note_params = {})
      request.env['HTTPS'] = 'on'
      post :create, params: { format: :json, student_id: student.id, event_note: event_note_params }
    end

    context 'admin educator logged in' do
      let(:educator) { FactoryBot.create(:educator, :admin, school: school) }
      let!(:student) { FactoryBot.create(:student, school: school) }
      let!(:event_note_type) { EventNoteType.first }

      before do
        sign_in(educator)
      end

      context 'valid request' do
        let(:post_params) {
          {
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'foo',
            is_restricted: false
          }
        }
        it 'creates a new event note' do
          expect { make_post_request(student, post_params) }.to change(EventNote, :count).by 1
        end
        it 'responds with json' do
          make_post_request(student, post_params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          expect(JSON.parse(response.body).keys).to eq [
            'id',
            'student_id',
            'educator_id',
            'event_note_type_id',
            'text',
            'recorded_at',
            'is_restricted',
            'event_note_revisions',
            'attachments'
          ]
        end
      end

      context 'with explicit educator_id' do
        it 'ignores the educator_id' do
          make_post_request(student, {
            educator_id: 350,
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'foo',
            is_restricted: false
          })
          response_body = JSON.parse(response.body)
          expect(response_body['educator_id']).to eq educator.id
          expect(response_body['educator_id']).not_to eq 350
        end
      end

      context 'fails with missing params' do
        it 'ignores the educator_id' do
          make_post_request(student, { text: 'foo' })
          expect(response.status).to eq 422
          response_body = JSON.parse(response.body)
          expect(response_body).to eq({
            "errors" => [
              "Student can't be blank",
              "Event note type can't be blank"
            ]
          })
        end
      end
    end

    context 'educator who can view restricted notes logged in' do
      let(:educator) { FactoryBot.create(:educator, :admin, school: school, can_view_restricted_notes: true) }
      let!(:student) { FactoryBot.create(:student, school: school) }
      let!(:event_note_type) { EventNoteType.first }

      before do
        sign_in(educator)
      end

      context 'valid request' do
        let(:post_params) {
          {
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'foo',
            is_restricted: true
          }
        }
        it 'responds with json' do
          make_post_request(student, post_params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          expect(JSON.parse(response.body).keys).to eq [
            'id',
            'student_id',
            'educator_id',
            'event_note_type_id',
            'text',
            'recorded_at',
            'is_restricted',
            'event_note_revisions',
            'attachments'
          ]
          expect(JSON.parse(response.body)["is_restricted"]).to eq true
        end
      end
    end

    context 'not logged in' do
      let!(:event_note_type) { EventNoteType.first }
      let!(:student) { FactoryBot.create(:student, school: school) }
      let(:post_params) {
        {
          student_id: student.id,
          event_note_type_id: event_note_type.id,
          recorded_at: Time.now,
          text: 'foo',
          is_restricted: false
        }
      }

      it 'creates a new event note' do
        make_post_request(student, { text: 'foo' })
        expect(response.status).to eq 401

        expect { make_post_request(student, post_params) }.to change(EventNote, :count).by 0
      end
    end
  end

  describe '#update' do
    def make_put_request(student, event_note_params = {})
      request.env['HTTPS'] = 'on'
      put :update, params: { format: :json, student_id: student.id, id: event_note_params[:id], event_note: event_note_params }
    end

    context 'admin educator logged in' do
      let(:educator) { FactoryBot.create(:educator, :admin, school: school) }
      let!(:student) { FactoryBot.create(:student, school: school) }
      let!(:event_note_type) { EventNoteType.first }

      before do
        sign_in(educator)
      end

      context 'valid first edit request' do
        let!(:event_note) { FactoryBot.create(:event_note) }
        let(:post_params) {
          {
            id: event_note.id,
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'bar',
            is_restricted: false
          }
        }
        it 'does not add a new event note' do
          expect { make_put_request(student, post_params) }.to change(EventNote, :count).by 0
        end
        it 'updates an existing event note' do
          Timecop.freeze(post_params[:recorded_at]) do
            make_put_request(student, post_params)
          end
          updated_event_note = EventNote.find(event_note.id)
          expect(updated_event_note.recorded_at.to_i).to eq event_note.recorded_at.to_i
          expect(updated_event_note.attributes.except(
            'educator_id',
            'created_at',
            'updated_at',
            'recorded_at'
          )).to eq post_params.stringify_keys.except(
            'created_at',
            'updated_at',
            'recorded_at'
          )
        end
        it 'creates a new event note revision' do
          expect { make_put_request(student, post_params) }.to change(EventNoteRevision, :count).by 1
        end
        it 'saves the previous note revision' do
          make_put_request(student, post_params)
          event_note_revision = EventNoteRevision.last
          expect(event_note_revision.event_note_id).to eq event_note.id
          expect(event_note_revision.version).to eq 1
          expect(event_note_revision.attributes.except(
            'id',
            'event_note_id',
            'version',
            'created_at',
            'updated_at',
            'is_restricted' # TODO: Revisit when we implement updating existing notes to be restricted.
          )).to eq event_note.attributes.except(
            'id',
            'created_at',
            'updated_at',
            'recorded_at',
            'is_restricted' # TODO: Revisit when we implement updating existing notes to be restricted.
          )
        end
      end

      context 'valid second edit request' do
        let!(:event_note_revision) { FactoryBot.create(:event_note_revision) }
        let!(:event_note) { event_note_revision.event_note }
        let!(:post_params) {
          {
            id: event_note.id,
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'baz'
          }
        }
        it 'creates a second event note revision' do
          make_put_request(student, post_params)
          expect(EventNoteRevision.last.version).to eq 2
        end
      end
    end

    context 'educator who can view restricted notes logged in' do
      let(:educator) { FactoryBot.create(:educator, :admin, school: school, can_view_restricted_notes: true) }
      let!(:student) { FactoryBot.create(:student, school: school) }
      let!(:event_note_type) { EventNoteType.first }

      before do
        sign_in(educator)
      end

      context 'valid first edit request' do
        let!(:event_note) { FactoryBot.create(:event_note) }
        let(:post_params) {
          {
            id: event_note.id,
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'bar',
            is_restricted: true
          }
        }
        it 'updates an existing event note' do
          Timecop.freeze(post_params[:recorded_at]) do
            make_put_request(student, post_params)
          end
          updated_event_note = EventNote.find(event_note.id)
          expect(updated_event_note.recorded_at.to_i).to eq event_note.recorded_at.to_i
          expect(updated_event_note.attributes.except(
            'educator_id',
            'created_at',
            'updated_at',
            'recorded_at'
          )).to eq post_params.stringify_keys.except(
            'created_at',
            'updated_at',
            'recorded_at'
          )
        end
      end
    end
  end
end
