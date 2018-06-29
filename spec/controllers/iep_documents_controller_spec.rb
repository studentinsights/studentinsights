require 'rails_helper'

RSpec.describe IepDocumentsController, type: :controller do

  describe '#show' do

    def make_request(id)
      request.env['HTTPS'] = 'on'
      get :show, params: { id: id }
    end

    class FakeAwsResponse
      def body; self end

      def read; 'eee' end
    end

    before do
      allow_any_instance_of(
        Aws::S3::Client
      ).to receive(
        :get_object
      ).and_return FakeAwsResponse.new
    end

    let(:student) { FactoryBot.create(:student) }

    subject {
      IepDocument.create(
        file_name: 'IEP Document',
        student: student,
      )
    }

    context 'educator has permissions for associated student' do
      let(:educator) { FactoryBot.create(:educator, districtwide_access: true) }
      before { sign_in(educator) }

      it 'renders a pdf' do
        make_request(subject.id)
        expect(response).to be_successful
      end
    end

    context 'educator does not have permissions for associated student' do
      let(:educator) { FactoryBot.create(:educator) }
      before { sign_in(educator) }

      it 'redirects' do
        make_request(subject.id)
        expect(response).to redirect_to('/not_authorized')
      end
    end

  end

end
