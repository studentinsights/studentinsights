require 'rails_helper'

RSpec.describe EventNoteAttachmentsController, type: :controller do

  def make_delete_request(id = nil)
    request.env['HTTPS'] = 'on'
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

    context 'unauthroized educator' do
      let(:educator) { FactoryBot.create(:educator) }

      it 'fails authorization' do
        make_delete_request(event_note_attachment.id)
        expect(response.code).to eq '302'
        expect(event_note.reload.event_note_attachments.size).to eq 1
      end

    end

    context 'on bad id' do
      it 'throws an error' do
        expect {
          make_delete_request(12345) # non-existent
        }.to raise_error ActiveRecord::RecordNotFound
      end

    end

  end

end
