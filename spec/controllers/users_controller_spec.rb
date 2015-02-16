require 'rails_helper'

describe UsersController, :type => :controller do

  describe '#send_pin' do

    context 'no email found' do

      it 'redirects to get pin page' do

        get :send_pin, user: { email: 'whoops@whoops.com' }
        expect(response).to redirect_to(get_pin_url)

      end

    end

    context 'no phone found' do

      it 'redirects to get pin page' do

        user = FactoryGirl.create(:user_without_phone)
        get :send_pin, user: { email: user.email }
        expect(response).to redirect_to(get_pin_url)

      end

    end

    context 'email and phone found' do

      it 'renders sign in page' do

        user = FactoryGirl.create(:user)
        get :send_pin, user: { email: user.email }
        expect(response).to be_success
        expect(response).to render_template("devise/sessions/new")

      end

    end

  end

end
