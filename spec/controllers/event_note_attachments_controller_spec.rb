require 'rails_helper'

RSpec.describe EventNoteAttachmentsController, type: :controller do

  def make_delete_request(id = nil)
    request.env['HTTPS'] = 'on'
    request.env['HTTP_ACCEPT'] = 'application/json'
    delete :destroy, params: { id: id }
  end

  describe '#destroy' do
    let(:educator) { FactoryBot.create(:educator, districtwide_access: true) }
    before { sign_in(educator) }

    let(:event_note) { FactoryBot.create(:event_note) }

    let!(:event_note_attachment) {
      EventNoteAttachment.create(url: 'www.goodurl.com', event_note: event_note)
    }

    context 'no error!' do
      it 'destroys the object and returns empty object' do
        make_delete_request(event_note_attachment.id)
        expect(response.body).to eq '{}'
        expect(event_note.reload.event_note_attachments.size).to eq 0
      end

    end

    context 'unauthorized educator' do
      let(:educator) { FactoryBot.create(:educator) }

      it 'fails authorization' do
        make_delete_request(event_note_attachment.id)
        expect(response.status).to eq 403
        expect(event_note.reload.event_note_attachments.size).to eq 1
      end

    end

    context 'on bad id' do
      it 'fails' do
        make_delete_request(12345) # non-existent
        expect(response.status).to eq 404
      end

    end

  end

end
