require 'rails_helper'

class FakeAwsResponse
  def body; self end
  def read; 'eee' end
end

RSpec.describe IepDocumentsController, type: :controller do
  let!(:pals) { TestPals.create! }

  describe '#show' do

    def make_request(id)
      request.env['HTTPS'] = 'on'
      get :show, params: { id: id }
    end

    before do
      allow_any_instance_of(
        Aws::S3::Client
      ).to receive(
        :get_object
      ).and_return FakeAwsResponse.new
    end

    def iep_pdf_response(educator, student)
      sign_in(educator)
      make_request(student.iep_document.id)
      sign_out(educator)
      response
    end

    it 'enforces authorization' do
      student = pals.healey_meredith_student
      expect(iep_pdf_response(pals.uri, student)).to be_success
      expect(iep_pdf_response(pals.healey_vivian_teacher, student)).to be_success
    end
  end
end
