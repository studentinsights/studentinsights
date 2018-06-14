require 'rails_helper'

RSpec.describe StudentPhotosController, type: :controller do
  let!(:pals) { TestPals.create! }

  describe '#show' do
    def make_request(student_id, id)
      request.env['HTTPS'] = 'on'
      get :show, params: { student_id: student_id, id: id }
    end

    def create_student_photo(params = {})
      StudentPhoto.create({
        student_id: pals.healey_kindergarten_student.id,
        file_digest: SecureRandom.hex,
        file_size: 1000 + SecureRandom.random_number(100000),
        s3_filename: SecureRandom.hex
      }.merge(params))
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

    let!(:student_photo) { create_student_photo() }

    context 'educator authorized for student photo (K homeroom teacher, HEA)' do
      before { sign_in(pals.healey_vivian_teacher) }

      it 'succeeds' do
        make_request(pals.healey_kindergarten_student.id, student_photo.id)
        expect(response).to be_success
      end
    end

    context 'educator not authorized for student photo (wrong school)' do
      before { sign_in(pals.shs_jodi) }

      it 'redirects' do
        make_request(pals.healey_kindergarten_student.id, student_photo.id)
        expect(response).not_to be_success
        expect(response).to redirect_to('/not_authorized')
      end
    end

    context 'not signed in' do
      it 'redirects' do
        make_request(pals.healey_kindergarten_student.id, student_photo.id)
        expect(response).not_to be_success
        expect(response).to redirect_to('/educators/sign_in')
      end
    end

    context 'student id sent in param doesn\'t match database' do
      before { sign_in(pals.healey_vivian_teacher) }
      let!(:another_student_photo) {
        create_student_photo(student_id: pals.shs_freshman_mari.id)
      }

      it 'succeeds' do
        expect {
          make_request(pals.healey_kindergarten_student.id, another_student_photo.id)
        }.to raise_error(Exceptions::StudentIdDoesNotMatch)
      end
    end
  end
end
