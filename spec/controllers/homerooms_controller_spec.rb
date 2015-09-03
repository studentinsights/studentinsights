require 'rails_helper'

describe HomeroomsController, :type => :controller do

  let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
  let!(:educator_without_homeroom) { FactoryGirl.create(:educator) }

  describe '#show' do

    def make_request(homeroom_slug = nil)
      request.env['HTTPS'] = 'on'
      get :show, homeroom_id: homeroom_slug
    end

    context 'when educator is not logged in' do
      it 'redirects to sign in page' do
        make_request(educator.homeroom.slug)
        expect(response).to redirect_to(new_educator_session_path)
      end
    end
    context 'when educator with homeroom is logged in' do
      before do
        sign_in(educator)
      end
      context 'no homeroom params' do
        it 'does not raise an error' do
          expect { make_request('garbage homeroom ids rule') }.not_to raise_error
        end
        it 'assigns the educators homeroom' do
          make_request(educator.homeroom.slug)
          expect(assigns(:homeroom)).to eq(educator.homeroom)
        end
        context 'when there are no students' do
          before { make_request }
          it 'is successful' do
            make_request
            expect(response).to be_success
          end
          it 'assigns rows to empty' do
            expect(assigns(:rows)).to be_empty
          end
        end
        context 'when there are students' do
          let!(:first_student) { FactoryGirl.create(:student, homeroom: educator.homeroom) }
          let!(:second_student) { FactoryGirl.create(:student, homeroom: educator.homeroom) }
          before { make_request }
          it 'assigns rows to a non-empty array' do
            expect(assigns(:rows)).to be_a_kind_of Array
            expect(assigns(:rows)).to_not be_empty
          end
        end
      end
    end
    context 'homeroom params' do
      context 'homeroom belongs to educator' do
        it 'is successful' do

        end
      end
      context 'homeroom is same school and grade level as educator\'s' do
        it 'is successful' do

        end
      end
      context 'homeroom is different school, same grade level as educator\'s' do
        it 'is not successful' do

        end
      end
      context 'homeroom is different school and grade level as educator\'s' do
        it 'is not successful' do

        end
      end
    end
    context 'when educator without homeroom is logged in' do
      before do
        sign_in(educator_without_homeroom)
      end
      context 'when there is no homeroom params' do
        it 'redirects to error page' do

        end
      end
    end
  end
end
