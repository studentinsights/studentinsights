require 'rails_helper'

describe StudentsController, :type => :controller do
  let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
  let!(:educator_without_homeroom) { FactoryGirl.create(:educator) }

  describe '#index' do
    def make_request(homeroom_slug = nil)
      get :index, homeroom_id: homeroom_slug
    end

    context 'when educator is not logged in' do
      it 'redirects to sign in page' do
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
          expect(assigns(:students)).to eq([first_student, second_student])
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
