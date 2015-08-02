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

  describe '#index' do
    def make_request(homeroom_slug = nil)
      request.env['HTTPS'] = 'on'
      get :index, homeroom_id: homeroom_slug
    end

    context 'when educator is not logged in' do
      it 'redirects to sign in page' do
        request.env['HTTPS'] = 'on'
        get :index
        expect(response).to redirect_to(new_educator_session_path)
      end
    end

    context 'when educator with homeroom is logged in' do
      before do
        sign_in(educator)
      end

      context 'when there is no homeroom params' do
        it 'does not raise an error' do
          expect { make_request('garbage homeroom ids rule') }.not_to raise_error
        end
        it 'assigns the educators homeroom' do
          make_request(educator.homeroom.slug)
          expect(assigns(:homeroom)).to eq(educator.homeroom)
        end
      end
      context 'when there are no students' do
        before { make_request }
        it 'is successful' do
          make_request
          expect(response).to be_success
        end
        it 'assigns an empty list of students' do
          expect(assigns(:students)).to be_empty
        end
      end
      context 'when there are students' do
        let!(:first_student) { FactoryGirl.create(:student, homeroom: educator.homeroom) }
        let!(:second_student) { FactoryGirl.create(:student, homeroom: educator.homeroom) }
        before { make_request }
        it 'assigns a list of students' do
          expect(assigns(:students)).to eq(educator.homeroom.students)
        end
      end
    end

    context 'when educator without homeroom is logged in' do
      before do
        sign_in(educator_without_homeroom)
      end
      context 'when there is no homeroom params' do
        it 'assigns the first homeroom' do
          make_request('garbage homeroom ids rule')
          expect(assigns(:homeroom)).to eq(Homeroom.first)
        end
      end
    end
  end
end
