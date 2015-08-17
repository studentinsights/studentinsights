require 'rails_helper'

describe StudentsController, :type => :controller do
  let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
  let!(:educator_without_homeroom) { FactoryGirl.create(:educator) }

  describe '#show' do
    def make_request(options = { student_id: nil, format: :html })
      request.env['HTTPS'] = 'on'
      get :show, id: options[:student_id], format: options[:format]
    end

    context 'when educator is not logged in' do
      let!(:student) { FactoryGirl.create(:student) }
      context 'html' do
        it 'redirects to sign in page' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to redirect_to(new_educator_session_path)
        end
      end
      context 'csv' do
        it 'sends a 401 unauthorized' do
          make_request({ student_id: student.id, format: :csv })
          expect(response.status).to eq 401
          expect(response.body).to eq "You need to sign in before continuing."
        end
      end
    end
    context 'when educator is logged in' do
      let!(:student) { FactoryGirl.create(:student) }
      before do
        sign_in(educator)
      end
      context 'html' do
        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_success
        end
        it 'assigns the student correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(assigns(:student)).to eq student
        end
      end
      context 'csv' do
        it 'is successful' do
          make_request({ student_id: student.id, format: :csv })
          expect(response).to be_success
        end
        it 'assigns the student correctly' do
          make_request({ student_id: student.id, format: :csv })
          expect(assigns(:student)).to eq student
        end
      end
    end
  end
end
